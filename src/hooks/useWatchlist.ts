import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "monkii_watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch {
      /* ignore */
    }
  }, [watchlist]);

  const isStarred = useCallback(
    (agentId: string) => watchlist.includes(agentId),
    [watchlist],
  );

  const toggleStar = useCallback((agentId: string) => {
    setWatchlist((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId],
    );
  }, []);

  return {
    watchlist,
    isStarred,
    toggleStar,
  };
}
