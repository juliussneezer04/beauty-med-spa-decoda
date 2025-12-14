// Type definitions derived from server.d.ts (OpenAPI generated types)
// Re-export component schemas for convenience

import type { components } from "@/server";

// Core entity types from server schema
export type PatientResponse = components["schemas"]["PatientResponse"];
export type ServiceResponse = components["schemas"]["ServiceResponse"];
export type PaymentResponse = components["schemas"]["PaymentResponse"];
export type ProviderResponse = components["schemas"]["ProviderResponse"];
export type AppointmentWithServices =
  components["schemas"]["AppointmentWithServices"];

// List response types
export type PatientListResponse = components["schemas"]["PatientListResponse"];
export type PatientDetailResponse =
  components["schemas"]["PatientDetailResponse"];
export type ProviderListResponse =
  components["schemas"]["ProviderListResponse"];

// Analytics types (from generated OpenAPI types)
export type TopServiceResponse = components["schemas"]["TopServiceResponse"];
export type PatientAnalyticsResponse =
  components["schemas"]["PatientAnalyticsResponse"];
export type BusinessAnalyticsResponse =
  components["schemas"]["BusinessAnalyticsResponse"];

// Generic paginated response (for backwards compatibility)
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

// Alias for backwards compatibility
export type Patient = PatientResponse;
export type Service = ServiceResponse;
export type Payment = PaymentResponse;
export type Provider = ProviderResponse;
