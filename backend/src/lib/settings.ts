import { pool } from "../db/index";

export async function getSetting(key: string, defaultValue = "false"): Promise<string> {
  try {
    const { rows } = await pool.query<{ value: string }>(
      `SELECT value FROM protocol_settings WHERE key = $1`,
      [key],
    );
    return rows[0]?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO protocol_settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
    [key, value],
  );
}

export async function isPonsClaimingEnabled(): Promise<boolean> {
  return (await getSetting("enable_pons_claiming", "true")) === "true";
}

export async function isMonkiClaimingEnabled(): Promise<boolean> {
  return (await getSetting("enable_monki_claiming", "false")) === "true";
}
