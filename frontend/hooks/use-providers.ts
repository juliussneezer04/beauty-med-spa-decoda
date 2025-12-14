/**
 * Hook for managing providers list page state and data fetching.
 * Handles pagination and search.
 */

import { useState, useCallback, useEffect } from "react";
import { getProviders, type GetProvidersParams } from "@/lib/api";
import type { ProviderResponse } from "@/lib/types";
import { debounce } from "lodash";

export interface UseProvidersOptions {
  initialLimit?: number;
}

export interface UseProvidersReturn {
  // Data
  providers: ProviderResponse[];
  total: number;
  hasMore: boolean;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  error: string | null;

  // Filters
  search: string;

  // Actions
  setSearch: (value: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const debouncedGetProviders = debounce(getProviders, 500, { leading: true });

export function useProviders(
  options: UseProvidersOptions = {}
): UseProvidersReturn {
  const { initialLimit = 20 } = options;

  // Data state
  const [providers, setProviders] = useState<ProviderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");

  // Fetch providers with current filters
  const fetchProviders = useCallback(
    async (searchQuery: string, shouldReset = false) => {
      try {
        if (shouldReset) {
          setCursor(null);
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const params: GetProvidersParams = {
          limit: initialLimit,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }
        if (!shouldReset && cursor) {
          params.cursor = cursor;
        }

        const data = await debouncedGetProviders(params);

        if (shouldReset) {
          setProviders(data.data);
        } else {
          setProviders((prev) => [...prev, ...data.data]);
        }

        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
        setTotal(data.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch providers"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, initialLimit]
  );

  // Reset and fetch when search changes
  useEffect(() => {
    fetchProviders(search, true);
  }, [fetchProviders, search]);

  // Load more providers
  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      await fetchProviders(search, false);
    }
  }, [fetchProviders, search, loadingMore, hasMore]);

  // Refresh (reset and fetch)
  const refresh = useCallback(async () => {
    await fetchProviders(search, true);
  }, [fetchProviders, search]);

  return {
    providers,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    search,
    setSearch,
    loadMore,
    refresh,
  };
}
