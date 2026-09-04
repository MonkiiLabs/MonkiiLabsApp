import { ConnectButton } from "@rainbow-me/rainbowkit";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { useWallet } from "@/hooks/useWallet";

/* =====================================================================
   The wallet control.

   Connecting and signing in are two different things, and the previous
   build let them look like the same thing. They are separated here:

     not connected   one red action, "Open session". It opens
                     RainbowKit's wallet picker and signs as soon as a
                     wallet lands, so the whole thing is one click
     wrong network   one red action: the network is the only problem
                     worth solving, so nothing else is offered
     connected       a quiet address chip, plus a red "Open session"
                     until the JWT exists
     signed in       the address chip and a green session marker, which
                     is a reading, not a button

   At most one red thing is visible at a time. That is the point: red
   means "this is the next move", so two of them would mean neither is.
   ===================================================================== */

export function WalletButton() {
  const { isAuthenticated, isAuthenticating, connectAndSignIn, switchWallet, authError } =
    useWallet();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!mounted) {
          // Reserve the space so the header does not jump on hydration.
          return <div className="h-9 w-[7.5rem]" aria-hidden />;
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={connectAndSignIn}
              className="act inline-flex h-9 items-center gap-2 px-fib3 text-label font-semibold"
            >
              Open session
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="act inline-flex h-9 items-center gap-2 px-fib3 text-label font-semibold"
            >
              Switch to Robinhood Chain
            </button>
          );
        }

        return (
          <div className="flex items-center gap-fib1">
            {!isAuthenticated ? (
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={connectAndSignIn}
                title={authError ?? "Sign a plain-text message to open your session. No gas."}
                className="act inline-flex h-9 items-center gap-1.5 px-fib2 text-label font-semibold"
              >
                {isAuthenticating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                <span>Open session</span>
              </button>
            ) : (
              <span
                title="Monkii Labs session active"
                className="hidden h-9 items-center gap-1.5 rounded-sm border border-alive/28 bg-alive/[0.08] px-fib2 font-mono text-micro font-semibold uppercase text-alive-lit sm:inline-flex"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Session
              </span>
            )}

            <button
              type="button"
              onClick={isAuthenticated ? openAccountModal : switchWallet}
              title={isAuthenticated ? "Wallet details" : "Use a different wallet"}
              className="act-quiet inline-flex h-9 items-center gap-2 px-fib2 font-mono text-micro font-semibold tabular-nums text-paper-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-alive" aria-hidden />
              <span>{account.displayName}</span>
              {account.displayBalance && (
                <span className="hidden text-paper-3 sm:inline">{account.displayBalance}</span>
              )}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
