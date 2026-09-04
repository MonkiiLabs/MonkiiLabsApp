import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { defineChain } from "viem";

import {
  CHAIN_EXPLORER_URL,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC_URL,
  NATIVE_CURRENCY,
} from "@/lib/config";

/**
 * Robinhood Chain — Arbitrum Orbit L2 (Chain ID 4663, Gas Token: ETH)
 */
export const robinhoodChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: {
    default: { http: [CHAIN_RPC_URL] },
    public: { http: [CHAIN_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: CHAIN_EXPLORER_URL },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "Monkii Labs",
  projectId:
    (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string) ||
    "3fcc6bba6f1de962d911bb5b5c3dba68",
  chains: [robinhoodChain],
  transports: {
    [robinhoodChain.id]: http(),
  },
  ssr: false,
});
