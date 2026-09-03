import fs from "fs";
import path from "path";
import { pool } from "./index";

export async function migrate(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("[Migrate] DATABASE_URL not set. Skipping automatic migrations.");
    return;
  }

  const client = await pool.connect();
  try {
    // 1. Create schema_migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Read all .sql files from db/migrations sorted alphabetically
    const migrationsDir = path.resolve(__dirname, "../../db/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[Migrate] Migrations directory not found at ${migrationsDir}`);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // 3. Query already applied migrations
    const { rows } = await client.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations"
    );
    const appliedSet = new Set(rows.map((r) => r.filename));

    // 4. Run unapplied migrations inside a transaction
    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      console.log(`[Migrate] Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, NOW())",
          [file]
        );
        await client.query("COMMIT");
        console.log(`[Migrate] Successfully applied: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[Migrate] Failed applying migration ${file}:`, err);
        throw err;
      }
    }
  } finally {
    client.release();
  }
}
