import "@rainbow-me/rainbowkit/styles.css";
import { connectorsForWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  binanceWallet,
  bitgetWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
  zerionWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, createStorage, http } from "wagmi";
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
 * True when WalletConnect is configured, and therefore when a wallet that
 * lives in a separate app can be reached at all. The connect surface reads
 * this to explain a short wallet list rather than presenting one as normal.
 */
export const walletConnectEnabled = Boolean(projectId);

/**
 * Both branches build RainbowKit connectors, because RainbowKit owns the only
 * connect surface in the app (see useWallet).
 *
 * That matters more than it looks. RainbowKit's modal lists wallets it
 * recognises: the ones `connectorsForWallets` tagged, plus whatever EIP-6963
 * discovery turns up in the page. Plain wagmi connectors carry neither, so the
 * previous fallback built `injected`/`metaMask`/`coinbaseWallet` that the modal
 * had no way to show. On a desktop with an extension, EIP-6963 still found the
 * extension and the modal looked fine. On a phone there is no extension to
 * discover and no WalletConnect to reach an app with, so the modal came up
 * completely empty, which is the "no wallets to connect" report.
 *
 * Without a project id the list is genuinely limited to what works in-page:
 * an injected provider (how the Robinhood Wallet in-app browser arrives) and
 * Coinbase Wallet, which carries its own SDK. Both are WalletConnect-free, so
 * `connectorsForWallets` does not reach the throw inside
 * `getWalletConnectConnector`. Every other wallet, and every mobile deep link,
 * needs the project id.
 */
const walletGroups = [
  {
    groupName: "Popular Wallets",
    wallets: [
      metaMaskWallet,
      trustWallet,
      coinbaseWallet,
      rainbowWallet,
      okxWallet,
      phantomWallet,
      walletConnectWallet,
    ],
  },
  {
    groupName: "More Wallets",
    wallets: [
      bitgetWallet,
      binanceWallet,
      zerionWallet,
      rabbyWallet,
      injectedWallet,
    ],
  },
];

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "Monkii Labs",
      projectId,
      wallets: walletGroups,
      chains: [robinhoodChain],
      transports: { [robinhoodChain.id]: http(CHAIN_RPC_URL) },
      storage,
      ssr: false,
    })
  : createConfig({
      chains: [robinhoodChain],
      connectors: connectorsForWallets(
        [{ groupName: "Available", wallets: [injectedWallet, coinbaseWallet] }],
        { appName: "Monkii Labs", projectId: "" },
      ),
      transports: { [robinhoodChain.id]: http(CHAIN_RPC_URL) },
      storage,
      ssr: false,
    });
