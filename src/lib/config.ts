/**
 * Runtime configuration.
 *
 * Values mirror the Monkii Labs API & Frontend Integration Guide. The base
 * URL can be overridden per environment; everything else is a property of
 * Robinhood Chain and is therefore constant.
 */

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL?.toString() ||
  import.meta.env.VITE_BACKEND_URL?.toString() ||
  import.meta.env.BACKEND_URL?.toString() ||
  "https://api.monkiilabs.app/api";

/** Live production API. Trailing slash stripped so paths can lead with "/". */
export const API_BASE_URL = RAW_BASE.replace(/\/$/, "");

/** Used only if the primary host is unreachable. */
export const API_FALLBACK_URL = (
  import.meta.env.VITE_API_FALLBACK_URL?.toString() ||
  "https://monkiilabs-api.onrender.com/api"
).replace(/\/$/, "");

/* ---- Robinhood Chain (Arbitrum Orbit L2) ---------------------------- */

export const CHAIN_ID = 4663;
export const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`; // 0x1237
export const CHAIN_NAME = "Robinhood Chain";
export const CHAIN_RPC_URL =
  import.meta.env.VITE_CHAIN_RPC_URL?.toString() || "https://rpc.robinhood.com";
export const CHAIN_EXPLORER_URL =
  import.meta.env.VITE_CHAIN_EXPLORER_URL?.toString() || "https://explorer.robinhood.com";

/** Gas is paid in native ETH on this L2. */
export const NATIVE_CURRENCY = { name: "Ether", symbol: "ETH", decimals: 18 } as const;

/* ---- Contracts ------------------------------------------------------- */

export const PONS_TOKEN_ADDRESS = "0x39dbed3a2bd333467115de45665cc57f813c4571" as const;
export const COMPANION_NFT_ADDRESS = "0xf478d04a5864d0d9bd9c942c41d6c900c11b43b4" as const;

/* ---- Staking policy defaults ------------------------------------------
   The live values arrive on GET /api/staking/status; these are only the
   fallbacks used before that request resolves. */

export const STAKING_POLICY_FALLBACK = {
  STAKE_FOR_MAX: 10_000,
  MAX_MULTIPLIER: 3.0,
  PREMIUM_THRESHOLD: 1_000,
} as const;

export function explorerTxUrl(txHash: string): string {
  return `${CHAIN_EXPLORER_URL}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${CHAIN_EXPLORER_URL}/address/${address}`;
}
