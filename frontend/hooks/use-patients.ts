/**
 * Hook for managing patients list page state and data fetching.
 * 
 * All filtering and sorting is done server-side via API calls.
 * When filters, sort, or search change, a new API call is made.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { getPatients, type GetPatientsParams } from "@/lib/api";
import type { PatientResponse } from "@/lib/types";

export interface UsePatientsOptions {
  initialLimit?: number;
}

export interface UsePatientsReturn {
  // Data
  patients: PatientResponse[];
  total: number;
  hasMore: boolean;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  error: string | null;

  // Filters
  search: string;
  genderFilter: string;
  sourceFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Actions
  setSearch: (value: string) => void;
  setGenderFilter: (value: string) => void;
  setSourceFilter: (value: string) => void;
  handleSort: (column: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePatients(
  options: UsePatientsOptions = {}
): UsePatientsReturn {
  const { initialLimit = 50 } = options;

  // Data from API (server-side filtered and sorted)
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Refs for debouncing and request tracking
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search setter - only this triggers API calls
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the actual API trigger
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch patients - called when filters, sort, or search change
  const fetchPatients = useCallback(
    async (
      searchQuery: string,
      gender: string,
      source: string,
      sort: string,
      order: "asc" | "desc",
      shouldReset = false
    ) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (shouldReset) {
          setCursor(null);
          setLoading(true);
          setError(null);
          // Clear patients list immediately when filters/sort change
          setPatients([]);
        } else {
          setLoadingMore(true);
        }

        const params: GetPatientsParams = {
          limit: initialLimit,
          sortBy: sort,
          sortOrder: order,
        };

        // Send all filters to API
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (gender) {
          params.gender = gender;
        }
        if (source) {
          params.source = source;
        }
        if (!shouldReset && cursor) {
          params.cursor = cursor;
        }

        const data = await getPatients(params);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (shouldReset) {
          setPatients(data.data);
        } else {
          setPatients((prev) => [...prev, ...data.data]);
        }

        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
        setTotal(data.total);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Couldn't get patients");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, initialLimit]
  );

  // Fetch when debounced search, filters, or sort change
  useEffect(() => {
    fetchPatients(debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder, true);
  }, [debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle column sort toggle
  const handleSort = useCallback((column: string) => {
    setSortBy((currentSortBy) => {
      if (currentSortBy === column) {
        setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
        return column;
      }
      setSortOrder("asc");
      return column;
    });
  }, []);

  // Load more patients
  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      await fetchPatients(debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder, false);
    }
  }, [fetchPatients, debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder, loadingMore, hasMore]);

  // Refresh (reset and fetch)
  const refresh = useCallback(async () => {
    await fetchPatients(debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder, true);
  }, [fetchPatients, debouncedSearch, genderFilter, sourceFilter, sortBy, sortOrder]);

  return {
    patients,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    search,
    genderFilter,
    sourceFilter,
    sortBy,
    sortOrder,
    setSearch,
    setGenderFilter,
    setSourceFilter,
    handleSort,
    loadMore,
    refresh,
  };
}
