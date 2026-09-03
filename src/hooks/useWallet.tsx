import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken, clearTokens } from "@/lib/tokenStorage";
import { ensureAuth } from "@/features/auth/ensureAuth";
import { getPhantomProvider, isMobileDevice, openInPhantomApp } from "@/lib/solana";
import { getMetaMaskProvider, openInMetaMaskApp } from "@/lib/ethereum";

interface WalletState {
  isConnected: boolean;
  walletType: string | null;
  address: string | null;
  formatAddress: (addr: string) => string;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  connect: (walletType: string, address: string) => void;
  disconnect: () => void;
  connectPhantom: () => Promise<{ success: boolean; address?: string; error?: string }>;
  connectMetaMask: () => Promise<{ success: boolean; address?: string; error?: string }>;
  isPhantomInstalled: boolean;
  isMetaMaskInstalled: boolean;
  isMobile: boolean;
  openPhantomApp: () => void;
  openMetaMaskApp: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isMobile] = useState(() => isMobileDevice());

  // Wallets inject late in some browsers; poll briefly after mount.
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      setIsPhantomInstalled(!!getPhantomProvider());
      setIsMetaMaskInstalled(!!getMetaMaskProvider());
    };
    check();
    const timers = [200, 600, 1200, 2000].map((ms) => window.setTimeout(check, ms));
    window.addEventListener("phantom#initialized", check);
    window.addEventListener("ethereum#initialized", check);
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      window.removeEventListener("phantom#initialized", check);
      window.removeEventListener("ethereum#initialized", check);
    };
  }, []);

  const connect = useCallback((type: string, addr: string) => {
    setWalletType(type);
    setAddress(addr);
    setIsConnected(true);
    localStorage.setItem("monkii_wallet", JSON.stringify({ type, address: addr }));
  }, []);

  // Restore a previous session, and silently re-approve with Phantom when it is trusted.
  useEffect(() => {
    const saved = localStorage.getItem("monkii_wallet");
    if (saved) {
      try {
        const { type, address: savedAddress } = JSON.parse(saved) as { type: string; address: string };
        setWalletType(type);
        setAddress(savedAddress);
        setIsConnected(true);
      } catch {
        localStorage.removeItem("monkii_wallet");
      }
    }

    const provider = getPhantomProvider();
    if (!provider) return;
    provider
      .connect({ onlyIfTrusted: true })
      .then((res) => connect("phantom", res.publicKey.toString()))
      .catch(() => {});
  }, [connect]);

  const disconnect = useCallback(() => {
    // Tokens are tied to wallet auth; clear them on disconnect.
    clearTokens();
    qc.clear();
    setWalletType(null);
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem("monkii_wallet");
    getPhantomProvider()?.disconnect?.().catch(() => {});
  }, [qc]);

  // Auto-disconnect when auth expires (apiFetch dispatches this)
  useEffect(() => {
    const handler = () => disconnect();
    window.addEventListener("monkii:authExpired", handler as EventListener);
    return () => window.removeEventListener("monkii:authExpired", handler as EventListener);
  }, [disconnect]);

  // Phantom account/disconnect events
  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider || walletType !== "phantom") return;

    const handleAccountChanged = (publicKey: unknown) => {
      const next = (publicKey as { toString(): string } | null)?.toString?.();
      if (!next) {
        disconnect();
        return;
      }
      if (next === address) return;
      setAddress(next);
      localStorage.setItem("monkii_wallet", JSON.stringify({ type: "phantom", address: next }));
      // Auth tokens belong to the previous key — reset and re-auth for the new one.
      clearTokens();
      qc.clear();
      ensureAuth({ walletType: "phantom", walletAddress: next }).catch(() => {});
    };
    const handleDisconnect = () => disconnect();

    provider.on("accountChanged", handleAccountChanged);
    provider.on("disconnect", handleDisconnect);
    return () => {
      provider.removeListener?.("accountChanged", handleAccountChanged);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [walletType, address, disconnect, qc]);

  const formatAddress = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr;

  const connectPhantom = async (): Promise<{ success: boolean; address?: string; error?: string }> => {
    const provider = getPhantomProvider();

    if (!provider) {
      // On a phone's normal browser there is no provider — hand off to the Phantom app browser.
      if (isMobileDevice()) {
        openInPhantomApp();
        return { success: false, error: "Opening Phantom… continue in the Phantom app browser." };
      }
      return {
        success: false,
        error: "Phantom is not installed. Add the Phantom browser extension, then reload.",
      };
    }

    try {
      const res = await provider.connect();
      const fullAddress = res.publicKey.toString();
      connect("phantom", fullAddress);
      if (!getAccessToken()) {
        ensureAuth({ walletType: "phantom", walletAddress: fullAddress }).catch(() => {});
      }
      return { success: true, address: fullAddress };
    } catch (error) {
      const err = error as { code?: number; message?: string };
      if (err.code === 4001) return { success: false, error: "Connection request was rejected" };
      return { success: false, error: err.message || "Failed to connect to Phantom" };
    }
  };

  const connectMetaMask = async (): Promise<{ success: boolean; address?: string; error?: string }> => {
    const provider = getMetaMaskProvider();

    if (!provider) {
      if (isMobileDevice()) {
        openInMetaMaskApp();
        return { success: false, error: "Opening MetaMask… continue in the MetaMask app browser." };
      }
      return {
        success: false,
        error: "MetaMask is not installed. Add the MetaMask browser extension, then reload.",
      };
    }

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const fullAddress = accounts?.[0];
      if (!fullAddress) return { success: false, error: "No MetaMask account was shared" };
      connect("metamask", fullAddress);
      if (!getAccessToken()) {
        ensureAuth({ walletType: "metamask", walletAddress: fullAddress }).catch(() => {});
      }
      return { success: true, address: fullAddress };
    } catch (error) {
      const err = error as { code?: number; message?: string };
      if (err.code === 4001) return { success: false, error: "Connection request was rejected" };
      return { success: false, error: err.message || "Failed to connect to MetaMask" };
    }
  };

  // MetaMask account/chain events
  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (!provider || walletType !== "metamask") return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const next = (args[0] as string[] | undefined)?.[0];
      if (!next) {
        disconnect();
        return;
      }
      if (next === address) return;
      setAddress(next);
      localStorage.setItem("monkii_wallet", JSON.stringify({ type: "metamask", address: next }));
      clearTokens();
      qc.clear();
      ensureAuth({ walletType: "metamask", walletAddress: next }).catch(() => {});
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    return () => provider.removeListener?.("accountsChanged", handleAccountsChanged);
  }, [walletType, address, disconnect, qc]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletType,
        address,
        formatAddress,
        showConnectModal,
        setShowConnectModal,
        connect,
        disconnect,
        connectPhantom,
        connectMetaMask,
        isPhantomInstalled,
        isMetaMaskInstalled,
        isMobile,
        openPhantomApp: openInPhantomApp,
        openMetaMaskApp: openInMetaMaskApp,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletState => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
