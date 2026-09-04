import { Route, Routes, useLocation } from "react-router-dom";

import DashHeader from "@/components/dashboard/DashHeader";
import DashSidebar from "@/components/dashboard/DashSidebar";
import EpochCard from "@/components/dashboard/EpochCard";
import WalletConnectModal from "@/components/WalletConnectModal";
import { useWallet } from "@/hooks/useWallet";

import HomePage from "@/pages/dashboard/HomePage";
import AgentsPage from "@/pages/dashboard/AgentsPage";
import AgentDetailPage from "@/pages/dashboard/AgentDetailPage";
import CompanionsPage from "@/pages/dashboard/CompanionsPage";
import StakingPage from "@/pages/dashboard/StakingPage";
import LeaderboardPage from "@/pages/dashboard/LeaderboardPage";
import AlertsPage from "@/pages/dashboard/AlertsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";

/**
 * Modern Robinhood Chain Laboratory Cockpit Shell.
 * High-tech ambient dark aesthetic, precision three-column layout, and responsive telemetry.
 */
const Dashboard = () => {
  const location = useLocation();
  const { showConnectModal, setShowConnectModal, connect } = useWallet();

  const wide =
    location.pathname.startsWith("/dashboard/staking") ||
    location.pathname.startsWith("/dashboard/leaderboard") ||
    location.pathname.startsWith("/dashboard/companions");

  return (
    <div className="min-h-screen bg-[#080c09] text-slate-100 relative selection:bg-emerald-500 selection:text-black">
      {/* High-tech telemetry grid and ambient atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(0,200,5,0.08),rgba(0,0,0,0))] opacity-80" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <DashHeader />

      <main className="mx-auto max-w-[1280px] px-4 pt-[76px] sm:px-6">
        <div className="flex gap-6 py-6">
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-[84px]">
              <DashSidebar />
            </div>
          </aside>

          <div className={`min-w-0 flex-1 ${wide ? "" : "xl:max-w-[700px]"}`}>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="agents/:id" element={<AgentDetailPage />} />
              <Route path="companions" element={<CompanionsPage />} />
              <Route path="staking" element={<StakingPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </div>

          {!wide && (
            <aside className="hidden w-[290px] shrink-0 xl:block">
              <div className="sticky top-[84px]">
                <EpochCard />
              </div>
            </aside>
          )}
        </div>
      </main>

      <WalletConnectModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onConnect={connect}
      />
    </div>
  );
};

export default Dashboard;
