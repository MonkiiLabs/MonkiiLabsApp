import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";
import { useConnectModal, useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";

import { AUTH_EXPIRED_EVENT } from "@/lib/api";
import { auth } from "@/features/api/endpoints";
import { CHAIN_ID, CHAIN_NAME } from "@/lib/config";
import { clearToken, getStoredAddress, getToken, setToken } from "@/lib/tokenStorage";

/* =====================================================================
   Wallet + session.

   RainbowKit owns connection; wagmi owns account state. This file owns
   only the second step: the Monkii Labs session, and nothing else.

   The previous version ran a parallel connection path over
   `window.ethereum` alongside RainbowKit: two sources of truth for "am I
   connected", a bespoke picker modal competing with RainbowKit's, and a
   `wallet_switchEthereumChain` call that only extensions understood. All
   of it is gone. There is one connect surface, and every wallet reaches
   it the same way.

   Two steps, both gasless:
     1. Connect:        RainbowKit modal, any wagmi connector
     2. Open a session: nonce → personal_sign → verify → JWT
   ===================================================================== */

export type ConnectResult = { success: boolean; address?: string; error?: string };

interface WalletState {
  isConnected: boolean;
  /** True only once a valid JWT is held for the connected address. */
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  address: string | null;
  /** The connector's own name, "MetaMask", "Rainbow", "WalletConnect". */
  walletType: string | null;
  /** True when the wallet is connected but pointed at another network. */
  isWrongNetwork: boolean;
  formatAddress: (addr: string) => string;
  /** Opens the RainbowKit connect modal. */
  openConnect: () => void;
  /**
   * The one entry point into the product. Opens RainbowKit's wallet
   * picker when there is nothing connected, then signs as soon as a
   * wallet arrives, so choosing a wallet and opening a session read as
   * one action instead of two.
   */
  connectAndSignIn: () => void;
  /** Drops the current wallet and reopens the picker to choose another. */
  switchWallet: () => void;
  /** Opens the RainbowKit account modal (balance, copy, disconnect). */
  openAccount: () => void;
  /** Moves the wallet onto Robinhood Chain. */
  switchToRobinhoodChain: () => void;
  /** Runs the gasless nonce → personal_sign → verify handshake. */
  signIn: () => Promise<boolean>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const { address: wagmiAddress, isConnected, connector, chainId } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const address = wagmiAddress ?? null;
  const isWrongNetwork = isConnected && chainId !== undefined && chainId !== CHAIN_ID;

  // Sync session state whenever the active address changes. A token
  // issued to one address must never be treated as valid for another.
  useEffect(() => {
    if (!address) {
      setIsAuthenticated(false);
      return;
    }
    const token = getToken();
    const stored = getStoredAddress();
    setIsAuthenticated(
      Boolean(token) && (!stored || stored.toLowerCase() === address.toLowerCase()),
    );
  }, [address]);

  // A wallet that connects while sitting on another network leaves the
  // app pointed at a chain it cannot read. Ask for the switch once per
  // arrival on a wrong chain: once, because the request opens a wallet
  // prompt, and re-firing it on every render would trap the user in it.
  const switchAttemptedFor = useRef<number | null>(null);
  useEffect(() => {
    if (!isConnected || chainId === undefined) {
      switchAttemptedFor.current = null;
      return;
    }
    if (chainId === CHAIN_ID) {
      switchAttemptedFor.current = null;
      return;
    }
    if (switchAttemptedFor.current === chainId) return;
    switchAttemptedFor.current = chainId;
    switchChain?.({ chainId: CHAIN_ID });
  }, [isConnected, chainId, switchChain]);

  // apiFetch raises this on any 401 response.
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

  const disconnect = useCallback(() => {
    clearToken();
    qc.clear();
    setIsAuthenticated(false);
    setAuthError(null);
    wagmiDisconnect();
  }, [qc, wagmiDisconnect]);

  /** Gasless nonce → personal_sign → verify handshake. */
  const signIn = useCallback(async (): Promise<boolean> => {
    if (!address) {
      setAuthError("Connect a wallet first.");
      return false;
    }

    // Signing on the wrong network produces a token the backend will
    // reject, so the switch is a precondition rather than a warning.
    if (chainId !== undefined && chainId !== CHAIN_ID) {
      setAuthError(`Switch your wallet to ${CHAIN_NAME}, then sign in.`);
      switchChain?.({ chainId: CHAIN_ID });
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { message } = await auth.nonce(address);
      const signature = await signMessageAsync({
        message,
        account: address as `0x${string}`,
      });
      const { token } = await auth.verify(address, signature);
      setToken(token, address);
      setIsAuthenticated(true);
      qc.invalidateQueries();
      return true;
    } catch (err) {
      const code = (err as { code?: number })?.code;
      const name = (err as { name?: string })?.name;
      const rejected = code === 4001 || name === "UserRejectedRequestError";
      setAuthError(
        rejected
          ? "Signature declined. Sign the message to open your session."
          : (err as Error)?.message || "Could not sign in.",
      );
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, switchChain, signMessageAsync, qc]);

  const openConnect = useCallback(() => openConnectModal?.(), [openConnectModal]);
  const openAccount = useCallback(() => openAccountModal?.(), [openAccountModal]);

  /* ---- Connect and sign as one action --------------------------------
     RainbowKit owns the wallet picker, and it only hands back control by
     updating the account state. So the intent to sign is recorded before
     the modal opens and acted on once a wallet actually lands. */
  const [pendingSignIn, setPendingSignIn] = useState(false);
  const [pendingPicker, setPendingPicker] = useState(false);

  const connectAndSignIn = useCallback(() => {
    if (!isConnected) {
      setPendingSignIn(true);
      openConnectModal?.();
      return;
    }
    void signIn();
  }, [isConnected, openConnectModal, signIn]);

  const switchWallet = useCallback(() => {
    // openConnectModal is undefined while a wallet is still connected, so
    // the picker has to wait for the disconnect to land.
    setPendingPicker(true);
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (!pendingPicker || isConnected || !openConnectModal) return;
    setPendingPicker(false);
    setPendingSignIn(true);
    openConnectModal();
  }, [pendingPicker, isConnected, openConnectModal]);

  useEffect(() => {
    if (!pendingSignIn) return;
    if (!isConnected || !address) return;
    // Hold while the chain switch requested on connect is still running;
    // signing on the wrong network mints a token the backend rejects.
    if (isWrongNetwork) return;
    setPendingSignIn(false);
    if (!isAuthenticated) void signIn();
  }, [pendingSignIn, isConnected, address, isWrongNetwork, isAuthenticated, signIn]);

  const switchToRobinhoodChain = useCallback(() => {
    if (switchChain) {
      switchChain({ chainId: CHAIN_ID });
      return;
    }
    openChainModal?.();
  }, [switchChain, openChainModal]);

  const value = useMemo<WalletState>(
    () => ({
      isConnected,
      isAuthenticated,
      isAuthenticating,
      authError,
      address,
      walletType: connector?.name ?? null,
      isWrongNetwork,
      formatAddress,
      openConnect,
      connectAndSignIn,
      switchWallet,
      openAccount,
      switchToRobinhoodChain,
      signIn,
      disconnect,
    }),
    [
      isConnected,
      isAuthenticated,
      isAuthenticating,
      authError,
      address,
      connector,
      isWrongNetwork,
      formatAddress,
      openConnect,
      connectAndSignIn,
      switchWallet,
      openAccount,
      switchToRobinhoodChain,
      signIn,
      disconnect,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletState => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
