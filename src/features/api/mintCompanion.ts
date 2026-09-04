import { getWalletClient, robinhoodChain } from "@/lib/chain";
import { ensureRobinhoodChain, getInjectedProvider } from "@/lib/ethereum";
import { companions } from "./endpoints";

/**
 * Two-step companion mint.
 *
 * The backend builds the calldata so the client carries no ABI, no contract
 * address and no chain assumptions. The wallet signs and broadcasts (paying
 * only native ETH gas — the mint itself is free), then the backend watches
 * the transaction and registers the token in the user's inventory.
 */
export async function mintCompanion(
  companionId: string,
  onStage?: (stage: "building" | "signing" | "verifying") => void,
): Promise<{ txHash: string }> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No wallet detected. Connect a wallet to mint.");

  // 1 — ask the backend for the transaction payload.
  onStage?.("building");
  const tx = await companions.buildMintTx(companionId);

  // The payload names the chain it must land on; make sure the wallet agrees
  // before we ask for a signature, or the mint silently goes to the wrong net.
  await ensureRobinhoodChain(provider);

  const walletClient = getWalletClient();
  if (!walletClient) throw new Error("Could not open a wallet client.");

  // 2 — user signs and broadcasts.
  onStage?.("signing");
  const [account] = await walletClient.getAddresses();
  // viem's overloads resolve against a union of transaction shapes; the
  // payload is a plain legacy call, so narrow it explicitly.
  const txHash = await walletClient.sendTransaction({
    account,
    chain: robinhoodChain,
    to: tx.to,
    data: tx.data,
    value: BigInt(tx.value ?? "0x0"),
    kzg: undefined,
  } as Parameters<typeof walletClient.sendTransaction>[0]);

  // 3 — backend confirms the receipt and writes the inventory row.
  onStage?.("verifying");
  await companions.verifyMint(txHash, companionId);

  return { txHash };
}
