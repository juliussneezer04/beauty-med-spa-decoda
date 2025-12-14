/**
 * API client for communicating with the FastAPI backend.
 * All functions make actual HTTP requests to the backend server.
 */

import type {
  PatientListResponse,
  PatientDetailResponse,
  ProviderListResponse,
  DemographicsResponse,
  SourcesResponse,
  ServicesAnalyticsResponse,
  ProvidersAnalyticsResponse,
  AppointmentsAnalyticsResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// Patients API
// ============================================================================

export interface GetPatientsParams {
  cursor?: string | null;
  limit?: number;
  search?: string;
  gender?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getPatients(
  params: GetPatientsParams
): Promise<PatientListResponse> {
  const queryParams = new URLSearchParams();

  if (params.cursor) queryParams.append("cursor", params.cursor);
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.gender) queryParams.append("gender", params.gender);
  if (params.source) queryParams.append("source", params.source);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/api/patients${queryString ? `?${queryString}` : ""}`;

  return apiFetch<PatientListResponse>(endpoint);
}

export async function getPatientById(
  id: string
): Promise<PatientDetailResponse> {
  return apiFetch<PatientDetailResponse>(`/api/patients/${id}`);
}

// ============================================================================
// Providers API
// ============================================================================

export interface GetProvidersParams {
  cursor?: string | null;
  limit?: number;
  search?: string;
}

export async function getProviders(
  params: GetProvidersParams
): Promise<ProviderListResponse> {
  const queryParams = new URLSearchParams();

  if (params.cursor) queryParams.append("cursor", params.cursor);
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/providers${queryString ? `?${queryString}` : ""}`;

  return apiFetch<ProviderListResponse>(endpoint);
}

// ============================================================================
// Analytics API
// ============================================================================

export async function getAnalyticsDemographics(): Promise<DemographicsResponse> {
  return apiFetch<DemographicsResponse>("/api/analytics/demographics");
}

export async function getAnalyticsSources(): Promise<SourcesResponse> {
  return apiFetch<SourcesResponse>("/api/analytics/sources");
}

export async function getAnalyticsServices(): Promise<ServicesAnalyticsResponse> {
  return apiFetch<ServicesAnalyticsResponse>("/api/analytics/services");
}

export async function getAnalyticsProviders(): Promise<ProvidersAnalyticsResponse> {
  return apiFetch<ProvidersAnalyticsResponse>("/api/analytics/providers");
}

export async function getAnalyticsAppointments(): Promise<AppointmentsAnalyticsResponse> {
  return apiFetch<AppointmentsAnalyticsResponse>("/api/analytics/appointments");
}
