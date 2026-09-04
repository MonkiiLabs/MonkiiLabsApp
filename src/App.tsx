import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { robinhoodChain, wagmiConfig } from "@/lib/wagmi";
import { WalletProvider } from "@/hooks/useWallet";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AboutPage from "@/pages/static/AboutPage";
import HelpPage from "@/pages/static/HelpPage";
import AccessibilityPage from "@/pages/static/AccessibilityPage";
import ContactPage from "@/pages/static/ContactPage";
import PrivacyPage from "@/pages/static/PrivacyPage";
import TermsPage from "@/pages/static/TermsPage";

const queryClient = new QueryClient();

/**
 * RainbowKit's modal is the one connect surface in the product, so it is
 * themed to the bench rather than left on its stock palette. Accent is
 * monkii red, because inside that modal every control is an action, and
 * green would contradict the rule that green is only ever a reading.
 */
const monkiiTheme = darkTheme({
  accentColor: "#E74435",
  accentColorForeground: "#F0E7D8",
  borderRadius: "small",
  overlayBlur: "small",
  fontStack: "system",
});

monkiiTheme.colors.modalBackground = "#1C1917";
monkiiTheme.colors.modalBorder = "rgba(240, 231, 216, 0.11)";
monkiiTheme.colors.modalText = "#F0E7D8";
monkiiTheme.colors.modalTextSecondary = "#A79D90";
monkiiTheme.colors.profileForeground = "#24201D";
monkiiTheme.colors.actionButtonBorder = "rgba(240, 231, 216, 0.11)";
monkiiTheme.colors.closeButtonBackground = "rgba(240, 231, 216, 0.06)";
monkiiTheme.colors.generalBorder = "rgba(240, 231, 216, 0.09)";
monkiiTheme.colors.menuItemBackground = "rgba(240, 231, 216, 0.05)";
monkiiTheme.colors.connectButtonBackground = "#1C1917";
monkiiTheme.fonts.body = "'Instrument Sans', system-ui, sans-serif";

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      {/* initialChain makes the connect flow ask the wallet to move to
          Robinhood Chain as part of connecting. Without it a wallet sitting
          on mainnet connects as chain 1, which does not match the only
          chain this config declares, and wagmi throws on the mismatch. */}
      <RainbowKitProvider
        theme={monkiiTheme}
        initialChain={robinhoodChain}
        appInfo={{ appName: "Monkii Labs" }}
      >
        <TooltipProvider>
          <WalletProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WalletProvider>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
