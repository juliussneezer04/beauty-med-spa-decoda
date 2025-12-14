"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getPatientAnalytics, getBusinessAnalytics } from "@/lib/api";
import type {
  PatientAnalyticsResponse,
  BusinessAnalyticsResponse,
} from "@/lib/types";

interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AnalyticsContextValue {
  patients: LoadingState<PatientAnalyticsResponse>;
  business: LoadingState<BusinessAnalyticsResponse>;
  refresh: () => void;
}

const initialLoadingState = <T,>(): LoadingState<T> => ({
  data: null,
  loading: true,
  error: null,
});

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<
    LoadingState<PatientAnalyticsResponse>
  >(initialLoadingState());
  const [business, setBusiness] = useState<
    LoadingState<BusinessAnalyticsResponse>
  >(initialLoadingState());

  const fetchPatients = useCallback(async () => {
    setPatients((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getPatientAnalytics();
      setPatients({ data, loading: false, error: null });
    } catch (err) {
      setPatients({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Couldn't get patient analytics",
      });
    }
  }, []);

  const fetchBusiness = useCallback(async () => {
    setBusiness((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getBusinessAnalytics();
      setBusiness({ data, loading: false, error: null });
    } catch (err) {
      setBusiness({
        data: null,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Couldn't get business analytics",
      });
    }
  }, []);

  const refresh = useCallback(() => {
    fetchPatients();
    fetchBusiness();
  }, [fetchPatients, fetchBusiness]);

  useEffect(() => {
    async function fetchData() {
      await refresh();
    }
    fetchData();
  }, [refresh]);

  return (
    <AnalyticsContext.Provider
      value={{
        patients,
        business,
        refresh,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within an AnalyticsProvider"
    );
  }
  return context;
}

// Individual hooks for each data type
export function usePatientAnalytics() {
  const { patients } = useAnalyticsContext();
  return patients;
}

export function useBusinessAnalytics() {
  const { business } = useAnalyticsContext();
  return business;
}
