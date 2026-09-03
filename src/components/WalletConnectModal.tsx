import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Check, Loader2, ExternalLink, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: string, address: string) => void;
}

const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    description: "Connect your Robinhood wallet",
    color: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
    installUrl: "https://phantom.app/download",
  },
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect with the MetaMask extension",
    color: "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20",
    installUrl: "https://metamask.io/download/",
  },
] as const;

const WalletConnectModal = ({ open, onOpenChange, onConnect }: WalletConnectModalProps) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    connectPhantom,
    connectMetaMask,
    isPhantomInstalled,
    isMetaMaskInstalled,
    isMobile,
    openPhantomApp,
    openMetaMaskApp,
  } = useWallet();

  const installedMap: Record<string, boolean> = {
    phantom: isPhantomInstalled,
    metamask: isMetaMaskInstalled,
  };
  const openAppMap: Record<string, () => void> = {
    phantom: openPhantomApp,
    metamask: openMetaMaskApp,
  };

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    setError(null);

    const result = id === "phantom" ? await connectPhantom() : await connectMetaMask();
    setConnectingId(null);

    if (result.success && result.address) {
      setConnectedId(id);
      toast.success(`${id === "phantom" ? "Phantom" : "MetaMask"} connected!`, {
        description: `Address: ${result.address}`,
      });
      setTimeout(() => {
        onConnect(id, result.address!);
        onOpenChange(false);
        setConnectedId(null);
      }, 900);
    } else {
      setError(result.error || "Failed to connect");
      toast.error("Connection failed", { description: result.error });
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setError(null);
    toast.info("You can connect your wallet anytime from the navbar");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setError(null);
          setConnectingId(null);
          setConnectedId(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-white border-2 border-dashboard-border rounded-3xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-sky/20 to-coral/10 p-6 pb-4">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-playful flex items-center justify-center">
              <Wallet className="w-8 h-8 text-coral" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-center text-claw-charcoal">
              Connect a wallet
            </DialogTitle>
            <DialogDescription className="text-center text-claw-gray-600 mt-2">
              Your Robinhood wallet is your account here — it holds your Companions and receives your
              rewards.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {WALLETS.map((wallet) => {
            const installed = installedMap[wallet.id];
            const connecting = connectingId === wallet.id;
            const connected = connectedId === wallet.id;

            if (installed) {
              return (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connectingId !== null}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${wallet.color} ${
                    connecting ? "ring-2 ring-sky" : ""
                  } ${connected ? "bg-green-500/10 border-green-500/30" : ""}`}
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-claw-charcoal">{wallet.name}</h3>
                    <p className="text-sm text-claw-gray-600">{wallet.description}</p>
                  </div>
                  {connecting && <Loader2 className="w-5 h-5 text-sky animate-spin" />}
                  {connected && <Check className="w-5 h-5 text-green-500" />}
                </button>
              );
            }

            if (isMobile) {
              return (
                <button
                  key={wallet.id}
                  onClick={openAppMap[wallet.id]}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${wallet.color}`}
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-claw-charcoal">Open in {wallet.name} app</h3>
                    <p className="text-sm text-claw-gray-600">
                      We'll reopen this page inside {wallet.name} to connect.
                    </p>
                  </div>
                  <Smartphone className="w-5 h-5 text-claw-gray-600" />
                </button>
              );
            }

            return (
              <div
                key={wallet.id}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${wallet.color} opacity-90`}
              >
                <span className="text-3xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-claw-charcoal">{wallet.name}</h3>
                  <p className="text-sm text-claw-gray-600">Extension not detected</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(wallet.installUrl, "_blank")}
                  className="rounded-full border-2 text-xs font-bold gap-1"
                >
                  Install
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            );
          })}

          {isMobile && (
            <p className="text-xs text-center text-claw-gray-600">
              Already have the app installed? Tap it above — it opens the wallet's built-in browser.
            </p>
          )}

          <div className="pt-4 border-t border-dashboard-border">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-claw-gray-600 hover:text-claw-charcoal hover:bg-cream rounded-xl"
            >
              Skip for now
            </Button>
          </div>

          <p className="text-xs text-center text-claw-gray-400 pt-2">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
