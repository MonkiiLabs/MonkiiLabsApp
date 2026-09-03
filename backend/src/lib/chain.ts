import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

import { env } from "./env";

export const robinhoodChain = defineChain({
  id: env.robinhoodChainId,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [env.robinhoodChainRpcUrl] },
  },
});

const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export class ClaimPreBroadcastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaimPreBroadcastError";
  }
}

export function getPublicClient() {
  return createPublicClient({
    chain: robinhoodChain,
    transport: http(env.robinhoodChainRpcUrl),
  });
}

/**
 * Disburses ERC-20 $PONS tokens from the platform pool wallet to recipient on Robinhood Chain.
 */
export async function disbursePonsClaim(
  recipientAddress: string,
  amountPons: number,
): Promise<{ txHash: string }> {
  if (
    !env.rewardPoolPrivateKey ||
    env.rewardPoolPrivateKey === "0x0000000000000000000000000000000000000000000000000000000000000001"
  ) {
    throw new ClaimPreBroadcastError("Pool wallet private key not configured");
  }

  const account = privateKeyToAccount(env.rewardPoolPrivateKey);
  const publicClient = getPublicClient();
  const walletClient = createWalletClient({
    account,
    chain: robinhoodChain,
    transport: http(env.robinhoodChainRpcUrl),
  });

  // Query token decimals dynamically (defaulting to 18)
  const decimals = await publicClient
    .readContract({
      address: env.ponsTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "decimals",
    })
    .catch(() => 18);

  const rawAmount = parseUnits(amountPons.toFixed(6), Number(decimals));

  try {
    const txHash = await walletClient.writeContract({
      address: env.ponsTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipientAddress as `0x${string}`, rawAmount],
    });
    return { txHash };
  } catch (err: any) {
    console.error("[chain] disbursePonsClaim failed:", err);
    throw new Error(`Failed to disburse PONS on Robinhood Chain: ${err.message}`);
  }
}
