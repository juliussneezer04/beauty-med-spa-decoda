/**
 * Hook for managing analytics page state and data fetching.
 * Fetches all analytics data in parallel for the dashboard.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAnalyticsDemographics,
  getAnalyticsSources,
  getAnalyticsServices,
  getAnalyticsProviders,
  getAnalyticsAppointments,
} from "@/lib/api";
import type {
  DemographicsResponse,
  SourcesResponse,
  ServicesAnalyticsResponse,
  ProvidersAnalyticsResponse,
  AppointmentsAnalyticsResponse,
} from "@/lib/types";

export interface AnalyticsData {
  demographics: DemographicsResponse;
  sources: SourcesResponse;
  services: ServicesAnalyticsResponse;
  providers: ProvidersAnalyticsResponse;
  appointments: AppointmentsAnalyticsResponse;
}

export interface UseAnalyticsReturn {
  // Data
  data: AnalyticsData | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [demographics, sources, services, providers, appointments] =
        await Promise.all([
          getAnalyticsDemographics(),
          getAnalyticsSources(),
          getAnalyticsServices(),
          getAnalyticsProviders(),
          getAnalyticsAppointments(),
        ]);

      setData({
        demographics,
        sources,
        services,
        providers,
        appointments,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
