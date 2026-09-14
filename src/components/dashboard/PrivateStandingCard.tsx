import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, EyeOff, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { signMessage } from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmi";
import {
  useStandingParams,
  useStandingProof,
  useStandingWitness,
  type StandingTier,
} from "@/features/zk/useStandingProof";
import { useWallet } from "@/hooks/useWallet";

/* =====================================================================
   Private standing.

   The one honest thing this component has to do is manage expectation.
   A proof takes roughly two minutes in the browser, which is fine for a
   thing you do once an epoch and unacceptable as a surprise. So the wait
   is stated before it starts, the stage is named while it runs, and the
   result is cached so it is paid once.
   ===================================================================== */

function Stage({ phase, elapsedMs }: { phase: string; elapsedMs: number }) {
  const seconds = Math.round(elapsedMs / 1000);
  const copy =
    phase === "signing"
      ? "Waiting for your signature"
      : phase === "compiling"
        ? "Building the circuit, this is the slow part"
        : "Generating the proof";

  return (
    <div className="flex items-center gap-2 text-label text-paper-3">
      <Loader2 className="h-4 w-4 animate-spin text-alive-lit" />
      <span>{copy}</span>
      {seconds > 0 && <span className="font-mono tabular-nums">{seconds}s</span>}
    </div>
  );
}

export default function PrivateStandingCard() {
  const { isAuthenticated, address } = useWallet();
  const [redeemed, setRedeemed] = useState<string | null>(null);

  // Through the wagmi connector, not window.ethereum, for the same reason
  // signing.ts does: the injected provider only exists for extensions, so
  // anyone on WalletConnect or in a wallet's own browser would fail here.
  const sign = useCallback(
    (message: string) =>
      signMessage(wagmiConfig, { message, account: address as `0x${string}` }),
    [address],
  );

  const { data: params } = useStandingParams();
  const { data: witness, error: witnessError } = useStandingWitness(
    Boolean(isAuthenticated && params?.published),
  );
  const { phase, elapsedMs, error, proof, prove, redeem } = useStandingProof(sign);

  // Only offer tiers this standing can actually satisfy. Proving a claim
  // that cannot hold burns two minutes to produce a guaranteed failure.
  const eligible = useMemo<StandingTier[]>(() => {
    if (!params?.tiers || !witness) return [];
    return params.tiers.filter((t) => witness.eligibleTiers.includes(t.key));
  }, [params, witness]);

  if (!params?.enabled) return null;

  const busy = phase === "signing" || phase === "compiling" || phase === "proving";

  const handleProve = async (tier: StandingTier) => {
    if (!witness) return;
    const entry = await prove(witness, tier);
    if (!entry) return;

    try {
      const result = await redeem(`tier-badge`, entry);
      setRedeemed(result.label);
      toast.success(`${result.label} verified`, {
        description: "Your standing was proved without revealing your address or balance.",
      });
    } catch (err: any) {
      const reason = err?.body?.error;
      toast.error(
        reason === "already_redeemed"
          ? "That standing has already been redeemed for this perk."
          : "The proof could not be redeemed.",
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-hair/15 bg-card text-card-foreground shadow-sm">
      <div className="border-b border-hair/10 bg-hair/[0.03] p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-alive/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-alive-lit">
            <EyeOff className="h-3 w-3" />
            Zero Knowledge
          </span>
          <span className="rounded-md border border-hair/15 bg-hair/5 px-2 py-0.5 font-mono text-[10px] text-paper-3">
            Epoch {params.epochIndex}
          </span>
        </div>
        <h3 className="mt-2 font-serif text-lg font-bold text-paper">Private Standing</h3>
        <p className="mt-1 max-w-2xl font-sans text-xs text-paper-3">
          Prove where you place on the leaderboard without showing your address, your balance or
          your exact rank. The proof is checked against a standing of {params.participants}{" "}
          nurturers that we publish and cannot change afterwards.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {!params.published && (
          <p className="text-label text-paper-3">
            No standing has been published for this epoch yet. Come back once it closes.
          </p>
        )}

        {params.published && witnessError && (
          <div className="flex items-start gap-2 rounded-xl border border-hair/10 bg-hair/[0.03] p-3 text-label text-paper-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-idle" />
            <span>
              You are not in this epoch's standing. Register a commitment and earn $MONKI, and you
              are included the next time it publishes.
            </span>
          </div>
        )}

        {witness && !busy && phase !== "ready" && (
          <>
            <p className="text-label text-paper-3">
              Proving runs entirely in your browser and takes about{" "}
              <strong className="text-paper">{params.provingHintSeconds} seconds</strong>. You do it
              once for this epoch; the result is kept and reused.
            </p>
            <div className="flex flex-wrap gap-2">
              {eligible.length === 0 ? (
                <span className="text-label text-paper-3">
                  Your current standing does not reach any tier yet.
                </span>
              ) : (
                eligible.map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => handleProve(tier)}
                    className="inline-flex items-center gap-2 rounded-xl border border-hair/15 bg-hair/5 px-3 py-2 font-mono text-xs font-bold text-paper-2 transition-all hover:bg-hair/15 hover:text-paper"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Prove {tier.label}
                    <span className="text-[10px] font-normal opacity-70">
                      top {tier.maxRank}
                      {tier.minStake > 0 ? ` · ${tier.minStake.toLocaleString()}+ staked` : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {busy && (
          <div className="space-y-2 rounded-xl border border-hair/10 bg-hair/[0.03] p-4">
            <Stage phase={phase} elapsedMs={elapsedMs} />
            <p className="text-[11px] text-paper-4">
              Leave this tab open. Nothing is uploaded while this runs.
            </p>
          </div>
        )}

        {phase === "ready" && proof && (
          <div className="flex items-start gap-2 rounded-xl border border-alive/30 bg-alive/10 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-alive-lit" />
            <div className="space-y-1">
              <p className="text-label font-bold text-paper">
                {redeemed ? `${redeemed} verified` : "Proof ready"}
              </p>
              <p className="font-mono text-[10px] text-paper-3">
                marker {proof.nullifier.slice(0, 18)}...
              </p>
              <p className="text-[11px] text-paper-4">
                This marker identifies the proof, never you. It is what stops one standing being
                redeemed twice.
              </p>
            </div>
          </div>
        )}

        {phase === "error" && error && (
          <p className="text-label text-act-lit">{error}</p>
        )}
      </div>
    </div>
  );
}
