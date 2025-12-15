"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  startTransition,
  type ReactNode,
} from "react";
import {
  getPatientAnalytics,
  getBusinessAnalytics,
  getProviderAnalytics,
  getPatientBehaviorAnalytics,
} from "@/lib/api";
import type {
  PatientAnalyticsResponse,
  BusinessAnalyticsResponse,
  ProviderAnalyticsResponse,
  PatientBehaviorResponse,
} from "@/lib/types";

interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AnalyticsContextValue {
  patients: LoadingState<PatientAnalyticsResponse>;
  business: LoadingState<BusinessAnalyticsResponse>;
  providers: LoadingState<ProviderAnalyticsResponse>;
  patientBehavior: LoadingState<PatientBehaviorResponse>;
  refresh: () => void;
}

const STORAGE_KEYS = {
  PATIENTS: "analytics_patients",
  BUSINESS: "analytics_business",
  PROVIDERS: "analytics_providers",
  PATIENT_BEHAVIOR: "analytics_patient_behavior",
} as const;

// Helper functions for localStorage operations
const loadFromStorage = <T,>(key: string): T | null => {
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

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Always start with loading state to match server render
  const [patients, setPatients] = useState<
    LoadingState<PatientAnalyticsResponse>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const [business, setBusiness] = useState<
    LoadingState<BusinessAnalyticsResponse>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const [providers, setProviders] = useState<
    LoadingState<ProviderAnalyticsResponse>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const [patientBehavior, setPatientBehavior] = useState<
    LoadingState<PatientBehaviorResponse>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const fetchPatients = useCallback(async (showLoading = true) => {
    setPatients((prev) => ({
      ...prev,
      loading: showLoading && prev.data === null,
      error: null,
    }));
    try {
      const data = await getPatientAnalytics();
      setPatients({ data, loading: false, error: null });
      // Persist to localStorage
      saveToStorage(STORAGE_KEYS.PATIENTS, data);
    } catch (err) {
      setPatients({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Couldn't get patient analytics",
      });
    }
  }, []);

  const fetchBusiness = useCallback(async (showLoading = true) => {
    setBusiness((prev) => ({
      ...prev,
      loading: showLoading && prev.data === null,
      error: null,
    }));
    try {
      const data = await getBusinessAnalytics();
      setBusiness({ data, loading: false, error: null });
      // Persist to localStorage
      saveToStorage(STORAGE_KEYS.BUSINESS, data);
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

  const fetchProviders = useCallback(async (showLoading = true) => {
    setProviders((prev) => ({
      ...prev,
      loading: showLoading && prev.data === null,
      error: null,
    }));
    try {
      const data = await getProviderAnalytics();
      setProviders({ data, loading: false, error: null });
      saveToStorage(STORAGE_KEYS.PROVIDERS, data);
    } catch (err) {
      setProviders({
        data: null,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Couldn't get provider analytics",
      });
    }
  }, []);

  const fetchPatientBehavior = useCallback(async (showLoading = true) => {
    setPatientBehavior((prev) => ({
      ...prev,
      loading: showLoading && prev.data === null,
      error: null,
    }));
    try {
      const data = await getPatientBehaviorAnalytics();
      setPatientBehavior({ data, loading: false, error: null });
      saveToStorage(STORAGE_KEYS.PATIENT_BEHAVIOR, data);
    } catch (err) {
      setPatientBehavior({
        data: null,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Couldn't get patient behavior analytics",
      });
    }
  }, []);

  const refresh = useCallback(
    async (showLoading = true) => {
      await Promise.all([
        fetchPatients(showLoading),
        fetchBusiness(showLoading),
        fetchProviders(showLoading),
        fetchPatientBehavior(showLoading),
      ]);
    },
    [fetchPatients, fetchBusiness, fetchProviders, fetchPatientBehavior]
  );

  // Load from localStorage and fetch fresh data (client-side only)
  // This effect syncs React state with localStorage (external system) and fetches fresh data
  useEffect(() => {
    async function loadData() {
      // Load cached data from localStorage first
      const cachedPatients = loadFromStorage<PatientAnalyticsResponse>(
        STORAGE_KEYS.PATIENTS
      );
      const cachedBusiness = loadFromStorage<BusinessAnalyticsResponse>(
        STORAGE_KEYS.BUSINESS
      );
      const cachedProviders = loadFromStorage<ProviderAnalyticsResponse>(
        STORAGE_KEYS.PROVIDERS
      );
      const cachedPatientBehavior = loadFromStorage<PatientBehaviorResponse>(
        STORAGE_KEYS.PATIENT_BEHAVIOR
      );

      const hasCachedData =
        cachedPatients !== null &&
        cachedBusiness !== null &&
        cachedProviders !== null &&
        cachedPatientBehavior !== null;

      // Always fetch fresh data in background to keep cache updated
      // Don't show loading if we have cached data (silent refresh)
      refresh(!hasCachedData);

      // Batch state updates using startTransition to avoid cascading renders
      startTransition(() => {
        if (cachedPatients) {
          setPatients({ data: cachedPatients, loading: false, error: null });
        }
        if (cachedBusiness) {
          setBusiness({ data: cachedBusiness, loading: false, error: null });
        }
        if (cachedProviders) {
          setProviders({ data: cachedProviders, loading: false, error: null });
        }
        if (cachedPatientBehavior) {
          setPatientBehavior({
            data: cachedPatientBehavior,
            loading: false,
            error: null,
          });
        }
      });
    }
    loadData();
  }, [refresh]);

  return (
    <AnalyticsContext.Provider
      value={{
        patients,
        business,
        providers,
        patientBehavior,
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

export function useProviderAnalytics() {
  const { providers } = useAnalyticsContext();
  return providers;
}

export function usePatientBehaviorAnalytics() {
  const { patientBehavior } = useAnalyticsContext();
  return patientBehavior;
}
