/**
 * Hook for managing providers list page state and data fetching.
 * Handles pagination and search with localStorage persistence.
 */

import {
  useState,
  useCallback,
  useEffect,
  startTransition,
  useRef,
} from "react";
import { getProviders, type GetProvidersParams } from "@/lib/api";
import type { ProviderResponse } from "@/lib/types";
import { debounce } from "lodash";

const STORAGE_KEY = "providers_cache";
const STORAGE_SEARCH_KEY = "providers_search";

interface CachedProvidersData {
  providers: ProviderResponse[];
  total: number;
  hasMore: boolean;
  cursor: string | null;
  search: string;
}

// Helper functions for localStorage operations
const loadFromStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

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

  // Load cached data from localStorage on mount
  const cachedData = loadFromStorage<CachedProvidersData>(STORAGE_KEY);
  const cachedSearch = loadFromStorage<string>(STORAGE_SEARCH_KEY) || "";

  // Data state - initialize from cache if available
  const [providers, setProviders] = useState<ProviderResponse[]>(
    cachedData?.providers || []
  );
  const [total, setTotal] = useState(cachedData?.total || 0);
  const [hasMore, setHasMore] = useState(cachedData?.hasMore || false);
  const [cursor, setCursor] = useState<string | null>(
    cachedData?.cursor || null
  );

  // Loading states - only show loading if no cached data
  const [loading, setLoading] = useState(!cachedData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state - restore from cache
  const [search, setSearch] = useState(cachedSearch);

  // Track if we've initialized from cache
  const hasInitializedRef = useRef(false);

  // Fetch providers with current filters
  const fetchProviders = useCallback(
    async (searchQuery: string, shouldReset = false, showLoading = true) => {
      try {
        if (shouldReset) {
          setCursor(null);
          // Only show loading if showLoading is true and we don't have data
          if (showLoading) {
            setLoading(true);
          }
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
        const newCursor = data.nextCursor;
        setCursor(newCursor);
        setTotal(data.total);

        // Persist to localStorage
        if (shouldReset) {
          const cacheData: CachedProvidersData = {
            providers: data.data,
            total: data.total,
            hasMore: data.hasMore,
            cursor: newCursor,
            search: searchQuery,
          };
          saveToStorage(STORAGE_KEY, cacheData);
          saveToStorage(STORAGE_SEARCH_KEY, searchQuery);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't get providers");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, initialLimit]
  );

  // Load from cache and fetch fresh data on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const hasCachedData = cachedData !== null && cachedData.search === search;

    // If we have cached data matching current search, use it and fetch silently
    if (hasCachedData) {
      // Fresh data will be fetched in background without showing loading
      fetchProviders(search, true, false);
    } else {
      // No cache or search changed, fetch normally
      fetchProviders(search, true, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Reset and fetch when search changes (after initial mount)
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    fetchProviders(search, true, true);
  }, [search, fetchProviders]);

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
