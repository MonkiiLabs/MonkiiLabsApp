import { useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import type { WalletKind } from "@/lib/ethereum";
import { BRAND } from "@/lib/brand";
import { CHAIN_ID, CHAIN_NAME } from "@/lib/config";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (walletType: string, address: string) => void;
}

interface Option {
  kind: WalletKind;
  name: string;
  blurb: string;
  glyph: string;
}

const OPTIONS: Option[] = [
  {
    kind: "robinhood",
    name: "Robinhood Wallet",
    blurb: `Native to ${CHAIN_NAME}. High-speed Arbitrum Orbit L2.`,
    glyph: "🪶",
  },
  {
    kind: "metamask",
    name: "MetaMask",
    blurb: "Automatic network prompt and RPC switch.",
    glyph: "🦊",
  },
  {
    kind: "injected",
    name: "Browser EVM Wallet",
    blurb: "Rabby, Coinbase, Brave, or any injected connector.",
    glyph: "🔌",
  },
];

const WalletConnectModal = ({ open, onOpenChange, onConnect }: WalletConnectModalProps) => {
  const {
    connectWallet,
    isAuthenticating,
    isRobinhoodInstalled,
    isMetaMaskInstalled,
    hasWallet,
    isMobile,
    openMetaMaskApp,
  } = useWallet();

  const { openConnectModal } = useConnectModal();
  const [pending, setPending] = useState<WalletKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availability: Record<WalletKind, boolean> = {
    robinhood: isRobinhoodInstalled,
    metamask: isMetaMaskInstalled,
    injected: hasWallet,
  };

  const handle = async (kind: WalletKind) => {
    // If RainbowKit modal is ready, prefer RainbowKit
    if (openConnectModal) {
      onOpenChange(false);
      openConnectModal();
      return;
    }

    setPending(kind);
    setError(null);
    const result = await connectWallet(kind);
    setPending(null);

    if (result.success && result.address) {
      onConnect?.(kind, result.address);
      onOpenChange(false);
      return;
    }
    setError(result.error ?? "Could not establish connection.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-white/15 bg-[#0e1310] p-6 text-white shadow-2xl backdrop-blur-2xl">
        <DialogTitle className="font-display text-xl font-bold tracking-tight text-white">
          Connect to Monkii Labs
        </DialogTitle>

        <p className="text-xs leading-relaxed text-slate-400">
          Deployed on {CHAIN_NAME} (Chain ID {CHAIN_ID}). Authentication is gasless and does not initiate on-chain transactions.
        </p>

        {openConnectModal && (
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              openConnectModal();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Open RainbowKit Connector
          </button>
        )}

        <ul className="space-y-2 pt-1">
          {OPTIONS.map((option) => {
            const available = availability[option.kind];
            const busy = pending === option.kind;
            return (
              <li key={option.kind}>
                <button
                  type="button"
                  disabled={Boolean(pending) || isAuthenticating}
                  onClick={() => handle(option.kind)}
                  className="flex w-full items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:border-emerald-500/30 hover:bg-white/10 active:scale-[0.99] disabled:opacity-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40 text-lg">
                    {option.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-bold text-white">
                      {option.name}
                    </span>
                    <span className="block text-xs text-slate-400">{option.blurb}</span>
                  </span>
                  {busy ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-400" />
                  ) : (
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        available
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-white/5 text-slate-500"
                      }`}
                    >
                      {available ? "Detected" : "Ready"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div className="min-w-0">
              <p>{error}</p>
              {isMobile && !hasWallet && (
                <button
                  type="button"
                  onClick={openMetaMaskApp}
                  className="mt-1.5 inline-flex items-center gap-1 font-semibold text-rose-400 hover:underline"
                >
                  Open in wallet browser
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 border-t border-white/10 pt-3 text-xs text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p>
            You will sign a plain-text cryptographic message proving address ownership. 100% gasless.
          </p>
        </div>

        {isAuthenticating && (
          <p className="flex items-center justify-center gap-2 font-mono text-xs text-emerald-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Waiting for wallet signature…
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
