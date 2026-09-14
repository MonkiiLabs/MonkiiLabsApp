import { Copy, ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useClaimable, useDashboardSummary, useProfile } from "@/features/api/hooks";
import { useWallet } from "@/hooks/useWallet";
import {
  AuthGate,
  ErrorPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
  Stat,
  fmt,
} from "@/components/dashboard/primitives";
import { BRAND, monkiiMark } from "@/lib/brand";
import { CHAIN_ID, CHAIN_NAME, explorerAddressUrl } from "@/lib/config";

const ProfileInner = () => {
  const { t } = useTranslation();
  const profile = useProfile();
  const summary = useDashboardSummary();
  const { data: balances } = useClaimable();
  const { address, disconnect, walletType } = useWallet();

  if (profile.isLoading) return <LoadingPanel label={t("profile.loading")} />;
  if (profile.isError) return <ErrorPanel error={profile.error} onRetry={profile.refetch} />;

  const user = profile.data;

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success(t("profile.copied"));
    } catch {
      toast.error(t("profile.copyFailed"));
    }
  };

  return (
    <div className="space-y-5">
      {/* Account Profile Header */}
      <Panel raised className="overflow-hidden">
        <div className="h-16 border-b border-hair/10 bg-gradient-to-r from-hair/[0.06] to-transparent" />
        <div className="-mt-10 p-5">
          <div className="flex items-center gap-4">
            <img
              src={monkiiMark}
              alt=""
              className="h-20 w-20 rounded-2xl border-2 border-alive/40 bg-bench object-cover"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-paper">
                {user?.displayName || t("profile.defaultName")}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-alive/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-alive-lit">
                  <ShieldCheck className="h-3 w-3" />
                  {t("profile.chainBadge")}
                </span>
                <span className="font-mono text-xs text-paper-3">
                  {t("profile.chainId", { id: CHAIN_ID })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <code className="rounded-xl border border-hair/10 bg-cream px-3 py-1.5 font-mono text-xs text-alive-lit">
              {address}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              aria-label={t("profile.copyAddress")}
              className="grid h-8 w-8 place-items-center rounded-xl border border-hair/10 bg-hair/[0.05] text-paper-2 transition-colors hover:bg-hair/10 hover:text-paper"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {address && (
              <a
                href={explorerAddressUrl(address)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-xl border border-hair/10 bg-hair/[0.05] px-3 py-1.5 font-mono text-xs font-semibold text-alive-lit transition-colors hover:bg-hair/10 hover:text-alive-lit"
              >
                {t("profile.explorer")} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </Panel>

      {/* Lifetime Record */}
      <Panel>
        <PanelHeader title={t("profile.lifetimeTitle")} />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Stat value={fmt(user?.totalMonkiEarned, 1)} label={t("profile.earned")} />
          <Stat
            value={user?.powerRank ? `#${user.powerRank}` : "-"}
            label={t("profile.fleetRank")}
            tone="coral"
          />
          <Stat value={fmt(summary.data?.totalHeartbeats)} label={t("profile.totalHeartbeats")} />
          <Stat value={fmt(summary.data?.streakDays)} label={t("profile.activeStreak")} tone="vital" />
        </div>
      </Panel>

      {/* Balances Ledger */}
      <Panel>
        <PanelHeader title={t("profile.ledgerTitle")} />
        <dl className="divide-y divide-hair/[0.05] px-5">
          {[
            { k: "profile.ledger.accrued", v: fmt(balances?.claimableMonki, 2) },
            { k: "profile.ledger.settled", v: fmt(balances?.claimedMonki, 2) },
            { k: "profile.ledger.stakedLedger", v: fmt(balances?.stakedMonki) },
            { k: "profile.ledger.ponsClaimable", v: fmt(balances?.claimablePons, 2) },
            { k: "profile.ledger.ponsClaimed", v: fmt(balances?.claimedPons, 2) },
            { k: "profile.ledger.stock", v: fmt(balances?.claimedMetaStock, 4) },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-3 text-xs">
              <dt className="text-paper-3">{t(row.k, { stockToken: BRAND.stockToken })}</dt>
              <dd className="font-mono font-semibold tabular-nums text-paper">{row.v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* Disconnect & Session Management */}
      <Panel>
        <PanelHeader title={t("profile.sessionTitle")} />
        <div className="p-5">
          <p className="text-xs leading-relaxed text-paper-3">
            {t("profile.sessionBody")}
          </p>
          <button
            type="button"
            onClick={disconnect}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-act/30 bg-act/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-act-lit transition-colors hover:bg-act/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("profile.disconnect")}
          </button>
        </div>
      </Panel>
    </div>
  );
};

const ProfilePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} intro={t("profile.intro")} />
      <AuthGate what={t("profile.authWhat")}>
        <ProfileInner />
      </AuthGate>
    </>
  );
};

export default ProfilePage;
