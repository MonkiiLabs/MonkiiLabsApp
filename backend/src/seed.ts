import "dotenv/config";
import { syncVirtualsAgents } from "./lib/virtuals";
import { pool } from "./db/index";

async function run() {
  console.log("🌱 Purging old mock agents...");
  await pool.query(
    `DELETE FROM agents WHERE id IN ('monkii-prime', 'neural-chimp', 'cipher-ape', 'quantum-gorilla')`,
  );

  console.log("🌱 Fetching live AI agent fleet from Virtuals Protocol...");
  const result = await syncVirtualsAgents(1, 60, "mindshare:desc");

  console.log(`✅ Success! Seeded ${result.synced} fresh real AI agents into the database.`);
}

run()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
