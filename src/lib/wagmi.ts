import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, createStorage, http } from "wagmi";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

import {
  CHAIN_EXPLORER_URL,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC_URL,
  NATIVE_CURRENCY,
} from "@/lib/config";

/**
 * Robinhood Chain, an Arbitrum Orbit L2. Chain id 4663, gas token ETH.
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

/**
 * WalletConnect project id, from VITE_WALLETCONNECT_PROJECT_ID.
 *
 * Everything in RainbowKit that builds connectors for you, `getDefaultConfig`
 * and `connectorsForWallets` alike, throws on a missing or empty projectId
 * rather than degrading. Because that happens at module scope it takes the
 * whole app down to a blank page, which is what a missing .env used to do
 * here. So the id is checked once, up front, and the no-id path never
 * touches those helpers.
 */
const projectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined)?.trim();

if (!projectId) {
  console.warn(
    "[monkii] VITE_WALLETCONNECT_PROJECT_ID is not set, so WalletConnect and " +
      "mobile wallets are unavailable. Browser extension wallets still work. " +
      "Create a project at https://cloud.reown.com and add the id to .env. " +
      "See .env.example.",
  );
}

/**
 * Persisted connection state is keyed by this version.
 *
 * wagmi rehydrates the last connector and chain id from localStorage on
 * boot. If that snapshot was written by a different set of connectors, the
 * restored chain id and the connector's real chain can disagree, and wagmi
 * raises "The current chain of the connector (id: 1) does not match the
 * connection's chain (id: 4663)". Bumping the key whenever the connector
 * set changes retires the stale snapshot instead of trying to reconcile it.
 */
const STORAGE_KEY = "monkii.wagmi.v2";

const storage =
  typeof window === "undefined"
    ? undefined
    : createStorage({ storage: window.localStorage, key: STORAGE_KEY });

/**
 * With an id, RainbowKit assembles the full wallet list including
 * WalletConnect. Without one, the app falls back to the connectors wagmi
 * can build unaided: any injected provider (which is how the Robinhood
 * Wallet in-app browser arrives), MetaMask, and Coinbase Wallet.
 */
export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "Monkii Labs",
      projectId,
      chains: [robinhoodChain],
      transports: { [robinhoodChain.id]: http(CHAIN_RPC_URL) },
      storage,
      ssr: false,
    })
  : createConfig({
      chains: [robinhoodChain],
      connectors: [
        injected({ shimDisconnect: true }),
        metaMask(),
        coinbaseWallet({ appName: "Monkii Labs" }),
      ],
      transports: { [robinhoodChain.id]: http(CHAIN_RPC_URL) },
      storage,
      ssr: false,
    });
