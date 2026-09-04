import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
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
 * themed to match the rest of the site rather than left on its stock
 * palette: white cloud panels, soft blue hairlines, coral for every
 * action, and generous rounding to sit with the pill buttons.
 */
const monkiiTheme = lightTheme({
  accentColor: "#E74435",
  accentColorForeground: "#FFFFFF",
  borderRadius: "large",
  overlayBlur: "small",
  fontStack: "system",
});

monkiiTheme.colors.modalBackground = "#FFFFFF";
monkiiTheme.colors.modalBorder = "hsl(199 30% 88%)";
monkiiTheme.colors.modalText = "hsl(220 13% 18%)";
monkiiTheme.colors.modalTextSecondary = "hsl(215 16% 47%)";
monkiiTheme.colors.profileForeground = "hsl(40 33% 97%)";
monkiiTheme.colors.actionButtonBorder = "hsl(199 30% 88%)";
monkiiTheme.colors.closeButtonBackground = "hsl(199 50% 95%)";
monkiiTheme.colors.generalBorder = "hsl(199 30% 88%)";
monkiiTheme.colors.menuItemBackground = "hsl(199 50% 95%)";
monkiiTheme.colors.connectButtonBackground = "#FFFFFF";
monkiiTheme.fonts.body = "'Nunito', system-ui, sans-serif";

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
