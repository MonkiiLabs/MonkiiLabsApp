import { useCallback, useEffect, useState } from "react";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";

import { useWallet } from "@/hooks/useWallet";
import { useRwaBalancesQuery } from "@/features/api/hooks";
import type { RwaTokenHolding } from "@/features/api/types";
import { CHAIN_RPC_URL, explorerAddressUrl } from "@/lib/config";
import { robinhoodChain } from "@/lib/wagmi";

const rwaPublicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(CHAIN_RPC_URL),
});

export interface EnrichedRwaHolding extends RwaTokenHolding {
  walletBalance: string;
  walletBalanceNum: number;
  explorerUrl: string;
}

export interface RealtimeBalancesState {
  monki: {
    claimable: number;
    claimed: number;
    staked: number;
    total: number;
  };
  pons: {
    claimable: number;
    claimed: number;
  };
  electionMode: "stock_elected" | "plain_pons";
  rwaHoldings: EnrichedRwaHolding[];
  activeRwaCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useRealtimeRwaBalances(): RealtimeBalancesState {
  const { address, isAuthenticated } = useWallet();
  const query = useRwaBalancesQuery();

  const [walletBalances, setWalletBalances] = useState<Record<string, { raw: string; num: number }>>({});
  const [isOnchainLoading, setIsOnchainLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch on-chain ERC-20 balances for each RWA stock token on Robinhood Chain
  const fetchOnchainBalances = useCallback(async (tokens: RwaTokenHolding[], walletAddress: string) => {
    if (!walletAddress || tokens.length === 0) return;

    try {
      setIsOnchainLoading(true);
      const results: Record<string, { raw: string; num: number }> = {};

      await Promise.all(
        tokens.map(async (token) => {
          try {
            if (!token.contractAddress || !token.contractAddress.startsWith("0x") || token.contractAddress.length !== 42) {
              results[token.symbol] = { raw: "0.00", num: 0 };
              return;
            }

            const rawBalance = await rwaPublicClient.readContract({
              address: token.contractAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [walletAddress as `0x${string}`],
            });

            const formatted = formatUnits(rawBalance, 18);
            const num = Number(formatted);
            // Formatted to reasonable precision
            const display = num > 0 ? (num < 0.0001 ? "<0.0001" : num.toFixed(4)) : "0.00";
            results[token.symbol] = { raw: display, num };
          } catch {
            // Contract not yet deployed or RPC reverted — fallback safely to 0
            results[token.symbol] = { raw: "0.00", num: 0 };
          }
        }),
      );

      setWalletBalances(results);
      setLastUpdated(new Date());
    } finally {
      setIsOnchainLoading(false);
    }
  }, []);

  // Update on-chain balances when query data or wallet address changes
  useEffect(() => {
    if (query.data?.rwaTokens && address && isAuthenticated) {
      fetchOnchainBalances(query.data.rwaTokens, address);
    }
  }, [query.data?.rwaTokens, address, isAuthenticated, fetchOnchainBalances]);

  // Combined refresh trigger
  const refetch = useCallback(async () => {
    const res = await query.refetch();
    if (res.data?.rwaTokens && address) {
      await fetchOnchainBalances(res.data.rwaTokens, address);
    }
  }, [query, address, fetchOnchainBalances]);

  const rawTokens = query.data?.rwaTokens ?? [];

  const enrichedHoldings: EnrichedRwaHolding[] = rawTokens.map((token) => {
    const onchain = walletBalances[token.symbol] ?? { raw: "0.00", num: 0 };
    return {
      ...token,
      walletBalance: onchain.raw,
      walletBalanceNum: onchain.num,
      explorerUrl: explorerAddressUrl(token.contractAddress),
    };
  });

  const activeRwaCount = enrichedHoldings.filter(
    (h) => h.electedPercentage > 0 || h.walletBalanceNum > 0 || h.projectedAccrual > 0,
  ).length;

  return {
    monki: query.data?.monki ?? {
      claimable: 0,
      claimed: 0,
      staked: 0,
      total: 0,
    },
    pons: query.data?.pons ?? {
      claimable: 0,
      claimed: 0,
    },
    electionMode: query.data?.election?.mode ?? "plain_pons",
    rwaHoldings: enrichedHoldings,
    activeRwaCount,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching || isOnchainLoading,
    lastUpdated: lastUpdated || (query.data?.timestamp ? new Date(query.data.timestamp) : null),
    refetch,
  };
}
