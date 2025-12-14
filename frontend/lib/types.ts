// Type definitions matching models.py schema

export interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female" | "other"
  source: "in_person" | "phone" | "instagram" | "tiktok" | "google" | "website"
  address: string
  phone: string
  email: string
  created_date: string
}

export interface Appointment {
  id: string
  patient_id: string
  status: "pending" | "confirmed" | "cancelled"
  created_date: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  created_date: string
}

export interface Provider {
  id: string
  first_name: string
  last_name: string
  specialty: string
  created_date: string
}

export interface Payment {
  id: string
  appointment_id: string
  amount: number
  payment_date: string
  created_date: string
}

export interface AppointmentService {
  id: string
  appointment_id: string
  service_id: string
  provider_id: string
  created_date: string
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
  total: number
}
