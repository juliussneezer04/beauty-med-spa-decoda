// TODO: Replace with actual backend API calls to Python server
// For now, these return empty arrays and objects as placeholders

import type { Patient, PaginatedResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Patients API
export async function getPatients(params: {
  cursor?: string | null;
  limit?: number;
  search?: string;
  gender?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Patient>> {
  // TODO: Replace with actual backend API call
  // const queryParams = new URLSearchParams()
  // if (params.cursor) queryParams.append("cursor", params.cursor)
  // if (params.limit) queryParams.append("limit", params.limit.toString())
  // if (params.search) queryParams.append("search", params.search)
  // if (params.gender) queryParams.append("gender", params.gender)
  // if (params.source) queryParams.append("source", params.source)
  // if (params.sortBy) queryParams.append("sortBy", params.sortBy)
  // if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)
  // const response = await fetch(`${API_BASE_URL}/api/patients?${queryParams}`)
  // return response.json()

  return {
    data: [],
    nextCursor: null,
    hasMore: false,
    total: 0,
  };
}

export async function getPatientById(id: string): Promise<{
  patient: Patient;
  appointments: Array<{
    id: string;
    patient_id: string;
    status: "pending" | "confirmed" | "cancelled";
    created_date: string;
    services: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      created_date: string;
    }>;
    payment: {
      id: string;
      appointment_id: string;
      amount: number;
      payment_date: string;
      created_date: string;
    } | null;
  }>;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/patients/${id}`)
  // return response.json()

  return {
    patient: {
      id: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "male",
      source: "in_person",
      address: "",
      phone: "",
      email: "",
      created_date: "",
    },
    appointments: [],
  };
}

// Providers API
export async function getProviders(params: {
  cursor?: string | null;
  limit?: number;
  search?: string;
}): Promise<
  PaginatedResponse<{
    id: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    appointmentCount: number;
    revenue: number;
  }>
> {
  // TODO: Replace with actual backend API call
  // const queryParams = new URLSearchParams()
  // if (params.cursor) queryParams.append("cursor", params.cursor)
  // if (params.limit) queryParams.append("limit", params.limit.toString())
  // if (params.search) queryParams.append("search", params.search)
  // const response = await fetch(`${API_BASE_URL}/api/providers?${queryParams}`)
  // return response.json()

  return {
    data: [],
    nextCursor: null,
    hasMore: false,
    total: 0,
  };
}

// Analytics API
export async function getAnalyticsDemographics(): Promise<{
  totalPatients: number;
  genderDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/analytics/demographics`)
  // return response.json()

  return {
    totalPatients: 0,
    genderDistribution: {},
    ageDistribution: {},
  };
}

export async function getAnalyticsSources(): Promise<{
  sourceDistribution: Record<string, number>;
  patientsByMonth: Record<string, number>;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/analytics/sources`)
  // return response.json()

  return {
    sourceDistribution: {},
    patientsByMonth: {},
  };
}

export async function getAnalyticsServices(): Promise<{
  topServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  totalRevenue: number;
  averagePayment: number;
  totalPayments: number;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/analytics/services`)
  // return response.json()

  return {
    topServices: [],
    totalRevenue: 0,
    averagePayment: 0,
    totalPayments: 0,
  };
}

export async function getAnalyticsProviders(): Promise<{
  providers: Array<{
    id: string;
    name: string;
    specialty: string;
    appointmentCount: number;
    revenue: number;
  }>;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/analytics/providers`)
  // return response.json()

  return {
    providers: [],
  };
}

export async function getAnalyticsAppointments(): Promise<{
  statusDistribution: Record<string, number>;
  avgServicesPerAppointment: string;
  appointmentsByDay: Record<string, number>;
  totalAppointments: number;
}> {
  // TODO: Replace with actual backend API call
  // const response = await fetch(`${API_BASE_URL}/api/analytics/appointments`)
  // return response.json()

  return {
    statusDistribution: {},
    avgServicesPerAppointment: "0.00",
    appointmentsByDay: {},
    totalAppointments: 0,
  };
}
