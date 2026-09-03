import { Routes, Route, useLocation } from "react-router-dom";
import DashHeader from "@/components/dashboard/DashHeader";
import DashSidebar from "@/components/dashboard/DashSidebar";
import EpochCard from "@/components/dashboard/EpochCard";
import HomePage from "@/pages/dashboard/HomePage";
import AgentsPage from "@/pages/dashboard/AgentsPage";
import AgentDetailPage from "@/pages/dashboard/AgentDetailPage";
import CompanionsPage from "@/pages/dashboard/CompanionsPage";
import StakingPage from "@/pages/dashboard/StakingPage";
import LeaderboardPage from "@/pages/dashboard/LeaderboardPage";
import AlertsPage from "@/pages/dashboard/AlertsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import WalletConnectModal from "@/components/WalletConnectModal";
import { useWallet } from "@/hooks/useWallet";
import { MonkiiProvider } from "@/features/monkii/store";

const DashboardShell = () => {
  const location = useLocation();
  const { showConnectModal, setShowConnectModal, connect } = useWallet();
  const wide = location.pathname.startsWith("/dashboard/staking");

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <DashHeader />

      <main className="pt-[68px] sm:pt-[80px] max-w-[1180px] mx-auto px-3 sm:px-4">
        <div className="flex gap-4 lg:gap-6 py-4 sm:py-6">
          <aside className="hidden lg:block w-[230px] xl:w-[250px] shrink-0">
            <div className="sticky top-[92px]">
              <DashSidebar />
            </div>
          </aside>

          <div className={`flex-1 min-w-0 ${wide ? "" : "xl:max-w-[600px]"}`}>
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
            <aside className="hidden xl:block w-[280px] shrink-0">
              <div className="sticky top-[92px] space-y-3">
                <EpochCard />
              </div>
            </aside>
          )}
        </div>
      </main>

      <WalletConnectModal open={showConnectModal} onOpenChange={setShowConnectModal} onConnect={connect} />
    </div>
  );
};

const Dashboard = () => (
  <MonkiiProvider>
    <DashboardShell />
  </MonkiiProvider>
);

export default Dashboard;
