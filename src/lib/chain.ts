import { createWalletClient, custom, defineChain, type WalletClient } from "viem";

import {
  CHAIN_EXPLORER_URL,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC_URL,
  NATIVE_CURRENCY,
} from "@/lib/config";
import { getInjectedProvider } from "@/lib/ethereum";

/** Robinhood Chain — Arbitrum Orbit L2, chain id 4663, gas in ETH. */
export const robinhoodChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: {
    default: { http: [CHAIN_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: CHAIN_EXPLORER_URL },
  },
});

/**
 * A viem wallet client over whatever EVM wallet the user has injected.
 * Returns null when no wallet is present so callers can prompt instead of
 * throwing on module load.
 */
export function getWalletClient(): WalletClient | null {
  const provider = getInjectedProvider();
  if (!provider) return null;
  return createWalletClient({
    chain: robinhoodChain,
    transport: custom(provider as never),
  });
}
