import { getAccessToken } from "@/lib/tokenStorage";
import { getNonce, loginWithSignature } from "@/features/auth/authApi";
import { base58Encode, getPhantomProvider } from "@/lib/solana";
import { getMetaMaskProvider, utf8ToHex } from "@/lib/ethereum";

export async function ensureAuth(params: {
  walletType: string | null;
  walletAddress: string | null;
}): Promise<void> {
  if (getAccessToken()) return;

  if (!params.walletAddress) {
    throw new Error("Wallet address missing.");
  }

  if (params.walletType === "phantom") {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom not available.");

    const { message } = await getNonce(params.walletAddress);
    // Phantom signs raw bytes and returns a signature as bytes; base58 is the canonical form.
    const encoded = new TextEncoder().encode(message);
    const { signature } = await provider.signMessage(encoded, "utf8");
    await loginWithSignature(params.walletAddress, base58Encode(signature));
    return;
  }

  if (params.walletType === "metamask") {
    const provider = getMetaMaskProvider();
    if (!provider) throw new Error("MetaMask not available.");

    const { message } = await getNonce(params.walletAddress);
    const signature = (await provider.request({
      method: "personal_sign",
      params: [utf8ToHex(message), params.walletAddress],
    })) as string;
    await loginWithSignature(params.walletAddress, signature);
    return;
  }

  throw new Error("Please connect Phantom or MetaMask to authenticate.");
}
