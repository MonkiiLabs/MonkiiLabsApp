import { getAccount, sendTransaction, switchChain } from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmi";
import { CHAIN_ID, CHAIN_NAME } from "@/lib/config";
import { companions } from "./endpoints";

/**
 * Two-step companion mint.
 *
 * The backend builds the calldata so the client carries no ABI, no contract
 * address and no chain assumptions. The wallet signs and broadcasts (paying
 * only native ETH gas: the mint itself is free), then the backend watches
 * the transaction and registers the token in the user's inventory.
 *
 * Everything goes through the wagmi connector rather than `window.ethereum`.
 * The injected provider only exists for browser extensions, so the previous
 * implementation could not mint from a WalletConnect session or from a
 * mobile wallet's in-app browser, which is where the PRD expects most
 * Robinhood Wallet traffic to arrive from.
 */
export async function mintCompanion(
  companionId: string,
  onStage?: (stage: "building" | "signing" | "verifying") => void,
): Promise<{ txHash: string }> {
  const { address, chainId } = getAccount(wagmiConfig);
  if (!address) throw new Error("Connect a wallet to mint.");

  // 1: ask the backend for the transaction payload.
  onStage?.("building");
  const tx = await companions.buildMintTx(companionId);

  // The payload names the chain it must land on, so make sure the wallet
  // agrees before asking for a signature: otherwise the mint silently
  // broadcasts to the wrong network.
  if (chainId !== CHAIN_ID) {
    try {
      await switchChain(wagmiConfig, { chainId: CHAIN_ID });
    } catch {
      throw new Error(`Switch your wallet to ${CHAIN_NAME} to mint.`);
    }
  }

  // 2: user signs and broadcasts.
  onStage?.("signing");
  const txHash = await sendTransaction(wagmiConfig, {
    account: address,
    chainId: CHAIN_ID,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    value: BigInt(tx.value ?? "0x0"),
  });

  // 3: backend confirms the receipt and writes the inventory row.
  onStage?.("verifying");
  await companions.verifyMint(txHash, companionId);

  return { txHash };
}
