import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { AUTH_EXPIRED_EVENT } from "@/lib/api";
import { auth } from "@/features/api/endpoints";
import {
  ensureRobinhoodChain,
  getProviderFor,
  hasInjectedWallet,
  isMetaMaskAvailable,
  isRobinhoodWalletAvailable,
  openInMetaMaskApp,
  type WalletKind,
} from "@/lib/ethereum";
import { clearToken, getStoredAddress, getToken, setToken } from "@/lib/tokenStorage";

/* =====================================================================
   Wallet + session.
   Powered by RainbowKit & Wagmi on Robinhood Chain (EVM Chain ID 4663).
   Two gasless steps:
   1. Wallet Connect (RainbowKit modal / Wagmi provider)
   2. Monkii Labs Session (nonce → personal_sign → verify JWT token)
   ===================================================================== */

const WALLET_KEY = "monkii_wallet";

export type ConnectResult = { success: boolean; address?: string; error?: string };

interface WalletState {
  isConnected: boolean;
  /** True only once a valid JWT is held for the connected address. */
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  walletType: WalletKind | null;
  address: string | null;
  formatAddress: (addr: string) => string;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  openRainbowModal: () => void;
  connect: (walletType: string, address: string) => void;
  connectWallet: (kind: WalletKind) => Promise<ConnectResult>;
  /** Runs the gasless nonce → personal_sign → verify handshake. */
  signIn: () => Promise<boolean>;
  disconnect: () => void;
  hasWallet: boolean;
  isRobinhoodInstalled: boolean;
  isMetaMaskInstalled: boolean;
  isMobile: boolean;
  openMetaMaskApp: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();

  const [legacyConnected, setLegacyConnected] = useState(false);
  const [legacyAddress, setLegacyAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletKind | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [hasWallet, setHasWallet] = useState(false);
  const [isRobinhoodInstalled, setIsRobinhoodInstalled] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isMobile] = useState(isMobileDevice);

  // Active address is wagmiAddress if connected via RainbowKit, else fallback to legacy
  const address = wagmiAddress ?? legacyAddress;
  const isConnected = wagmiConnected || legacyConnected;

  // Detect available browser extensions
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      setHasWallet(hasInjectedWallet());
      setIsRobinhoodInstalled(isRobinhoodWalletAvailable());
      setIsMetaMaskInstalled(isMetaMaskAvailable());
    };
    check();
    const timers = [200, 600, 1200, 2000].map((ms) => window.setTimeout(check, ms));
    window.addEventListener("ethereum#initialized", check);
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      window.removeEventListener("ethereum#initialized", check);
    };
  }, []);

  // Sync authentication state whenever active address changes
  useEffect(() => {
    if (!address) {
      setIsAuthenticated(false);
      return;
    }
    const token = getToken();
    const stored = getStoredAddress();
    const isMatching =
      Boolean(token) && (!stored || stored.toLowerCase() === address.toLowerCase());
    setIsAuthenticated(isMatching);
  }, [address]);

  // apiFetch raises this on any 401 response
  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(false);
      setAuthError("Session expired. Sign in again.");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
  }, []);

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return "";
    return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
  }, []);

  const connect = useCallback((type: string, addr: string) => {
    const kind = (type as WalletKind) ?? "injected";
    setWalletType(kind);
    setLegacyAddress(addr);
    setLegacyConnected(true);
    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify({ type: kind, address: addr }));
    } catch {
      /* ignore */
    }
  }, []);

  const disconnect = useCallback(() => {
    clearToken();
    qc.clear();
    setWalletType(null);
    setLegacyAddress(null);
    setLegacyConnected(false);
    setIsAuthenticated(false);
    setAuthError(null);
    try {
      localStorage.removeItem(WALLET_KEY);
    } catch {
      /* ignore */
    }
    wagmiDisconnect();
  }, [qc, wagmiDisconnect]);

  /** Gasless nonce → personal_sign → verify authentication handshake */
  const signIn = useCallback(async (): Promise<boolean> => {
    const targetAddr = address;
    if (!targetAddr) {
      setAuthError("No wallet connected. Connect your wallet first.");
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // 1. Request nonce and sign-in message from backend
      const { message } = await auth.nonce(targetAddr);

      // 2. Request user signature via Wagmi / RainbowKit signer
      let signature: string;
      try {
        signature = await signMessageAsync({ message });
      } catch (wagmiErr) {
        // Fallback to injected provider if wagmi connector sign message fails
        const provider = getProviderFor("injected");
        if (provider) {
          const { personalSign } = await import("@/lib/ethereum");
          signature = await personalSign(provider, targetAddr, message);
        } else {
          throw wagmiErr;
        }
      }

      // 3. Verify signature with backend to receive JWT token
      const { token } = await auth.verify(targetAddr, signature);
      setToken(token, targetAddr);
      setIsAuthenticated(true);
      qc.invalidateQueries();
      return true;
    } catch (err) {
      const code = (err as { code?: number })?.code;
      setAuthError(
        code === 4001
          ? "Signature declined. Sign message to open your Monkii Labs session."
          : (err as Error)?.message || "Could not sign in.",
      );
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, qc]);

  const openRainbowModal = useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      setShowConnectModal(true);
    }
  }, [openConnectModal]);

  const handleSetShowConnectModal = useCallback(
    (show: boolean) => {
      if (show && openConnectModal) {
        openConnectModal();
      } else {
        setShowConnectModal(show);
      }
    },
    [openConnectModal],
  );

  const connectWallet = useCallback(
    async (kind: WalletKind): Promise<ConnectResult> => {
      // If RainbowKit modal is available, open it
      if (openConnectModal) {
        openConnectModal();
        return { success: true };
      }

      const provider = getProviderFor(kind);
      if (!provider) {
        if (isMobileDevice() && kind === "metamask") {
          openInMetaMaskApp();
          return { success: false, error: "Opening MetaMask… continue in its in-app browser." };
        }
        return {
          success: false,
          error:
            kind === "robinhood"
              ? "Robinhood Wallet not detected. Open this page in the Robinhood app browser."
              : "No EVM wallet detected.",
        };
      }

      try {
        const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
        const account = accounts?.[0];
        if (!account) return { success: false, error: "No account was shared." };

        await ensureRobinhoodChain(provider).catch(() => {});
        connect(kind, account);
        return { success: true, address: account };
      } catch (error) {
        const err = error as { code?: number; message?: string };
        if (err.code === 4001) return { success: false, error: "Connection request was rejected." };
        return { success: false, error: err.message || "Failed to connect." };
      }
    },
    [connect, openConnectModal],
  );

  const value = useMemo<WalletState>(
    () => ({
      isConnected,
      isAuthenticated,
      isAuthenticating,
      authError,
      walletType: (connector?.id as WalletKind) ?? walletType,
      address,
      formatAddress,
      showConnectModal,
      setShowConnectModal: handleSetShowConnectModal,
      openRainbowModal,
      connect,
      connectWallet,
      signIn,
      disconnect,
      hasWallet,
      isRobinhoodInstalled,
      isMetaMaskInstalled,
      isMobile,
      openMetaMaskApp: openInMetaMaskApp,
    }),
    [
      isConnected,
      isAuthenticated,
      isAuthenticating,
      authError,
      connector,
      walletType,
      address,
      formatAddress,
      showConnectModal,
      handleSetShowConnectModal,
      openRainbowModal,
      connect,
      connectWallet,
      signIn,
      disconnect,
      hasWallet,
      isRobinhoodInstalled,
      isMetaMaskInstalled,
      isMobile,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletState => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
