/**
 * Hook for managing patients list page state and data fetching.
 * Handles pagination, filtering, sorting, and search.
 */

import { useState, useCallback, useEffect } from "react";
import { getPatients, type GetPatientsParams } from "@/lib/api";
import type { PatientResponse } from "@/lib/types";
import { debounce } from "lodash";

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

const debouncedGetPatients = debounce(getPatients, 500, { leading: true });

export function usePatients(
  options: UsePatientsOptions = {}
): UsePatientsReturn {
  const { initialLimit = 50 } = options;

  // Data state
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch patients with current filters
  const fetchPatients = useCallback(
    async (searchQuery: string, shouldReset = false) => {
      try {
        if (shouldReset) {
          setCursor(null);
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const params: GetPatientsParams = {
          limit: initialLimit,
          sortBy,
          sortOrder,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }
        if (genderFilter) {
          params.gender = genderFilter;
        }
        if (sourceFilter) {
          params.source = sourceFilter;
        }
        if (!shouldReset && cursor) {
          params.cursor = cursor;
        }

        const data = await debouncedGetPatients(params);

        if (shouldReset) {
          setPatients(data.data);
        } else {
          setPatients((prev) => [...prev, ...data.data]);
        }

        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
        setTotal(data.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch patients"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, genderFilter, sourceFilter, sortBy, sortOrder, initialLimit]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    fetchPatients(search, true);
  }, [fetchPatients, search]);

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
      await fetchPatients(search, false);
    }
  }, [fetchPatients, search, loadingMore, hasMore]);

  // Refresh (reset and fetch)
  const refresh = useCallback(async () => {
    await fetchPatients(search, true);
  }, [fetchPatients, search]);

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
