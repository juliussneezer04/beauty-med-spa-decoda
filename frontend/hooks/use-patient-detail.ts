/**
 * Hook for managing patient detail page state and data fetching.
 * Fetches patient info along with their appointments.
 */

import { useState, useEffect, useCallback } from "react";
import { getPatientById } from "@/lib/api";
import type { PatientDetailResponse } from "@/lib/types";

export interface UsePatientDetailReturn {
  // Data
  data: PatientDetailResponse | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

export function usePatientDetail(patientId: string): UsePatientDetailReturn {
  const [data, setData] = useState<PatientDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientDetail = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getPatientById(patientId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch patient details"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  const refresh = useCallback(async () => {
    await fetchPatientDetail();
  }, [fetchPatientDetail]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
