import { pool } from "../db/index";

export async function getProtocolSetting(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const { rows } = await pool.query<{ value: string }>(
      `SELECT value FROM protocol_settings WHERE key = $1`,
      [key],
    );
    return rows[0]?.value ?? defaultValue;
  } catch (err) {
    console.error(`[settings] Failed to get ${key}:`, err);
    return defaultValue;
  }
}

export async function setProtocolSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO protocol_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value],
  );
}

export const getSetting = getProtocolSetting;
export const setSetting = setProtocolSetting;

/**
 * Checks whether $MONKI on-chain claiming is enabled.
 * Defaults to FALSE during Pre-Launch / Pre-TGE mining phase.
 */
export async function isMonkiClaimingEnabled(): Promise<boolean> {
  if (process.env.ENABLE_MONKI_CLAIMING === "false" || process.env.ENABLE_MONKI_CLAIMING === "0") {
    return false;
  }
  if (process.env.ENABLE_MONKI_CLAIMING === "true" || process.env.ENABLE_MONKI_CLAIMING === "1") {
    return true;
  }
  const val = await getProtocolSetting("enable_monki_claiming", "false");
  return val === "true" || val === "1";
}

/**
 * Checks whether $PONS staking payout claims are enabled.
 * Defaults to TRUE (active daily epoch settlement).
 */
export async function isPonsClaimingEnabled(): Promise<boolean> {
  if (process.env.ENABLE_PONS_CLAIMING === "false" || process.env.ENABLE_PONS_CLAIMING === "0") {
    return false;
  }
  const val = await getProtocolSetting("enable_pons_claiming", "true");
  return val === "true" || val === "1";
}

/**
 * Checks whether Companion NFT on-chain minting & milestone claims are enabled.
 * Defaults to TRUE.
 */
export async function isCompanionMintingEnabled(): Promise<boolean> {
  if (process.env.ENABLE_COMPANION_MINTING === "false" || process.env.ENABLE_COMPANION_MINTING === "0") {
    return false;
  }
  const val = await getProtocolSetting("enable_companion_minting", "true");
  return val === "true" || val === "1";
}

export async function getAllProtocolSettings() {
  const [monki, pons, companion] = await Promise.all([
    isMonkiClaimingEnabled(),
    isPonsClaimingEnabled(),
    isCompanionMintingEnabled(),
  ]);

  return {
    enableMonkiClaiming: monki,
    enablePonsClaiming: pons,
    enableCompanionMinting: companion,
  };
}
