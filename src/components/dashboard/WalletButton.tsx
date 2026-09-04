import { ConnectButton } from "@rainbow-me/rainbowkit";
import { KeyRound, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const { isAuthenticated, isAuthenticating, signIn, authError } = useWallet();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-900/30 active:scale-[0.98]"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/25"
            >
              Switch to Robinhood Chain
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => void signIn()}
                title={authError ?? "Sign plain-text message to authenticate session (gasless)"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/25 active:scale-95 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                ) : (
                  <KeyRound className="h-3 w-3 text-amber-400" />
                )}
                <span>Sign In</span>
              </button>
            ) : (
              <span
                title="Monkii Labs session active"
                className="hidden items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 sm:inline-flex"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Session
              </span>
            )}

            <button
              type="button"
              onClick={openChainModal}
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 md:inline-flex"
            >
              {chain.hasIcon && (
                <div className="h-3.5 w-3.5 overflow-hidden rounded-full">
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? "Chain icon"}
                      src={chain.iconUrl}
                      className="h-3.5 w-3.5"
                    />
                  )}
                </div>
              )}
              <span className="font-mono text-[11px]">{chain.name}</span>
            </button>

            <button
              type="button"
              onClick={openAccountModal}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px]">{account.displayName}</span>
              {account.displayBalance && (
                <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">
                  ({account.displayBalance})
                </span>
              )}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
