import { type NextRequest, NextResponse } from "next/server"
import { patients, appointments, payments, appointmentServices, services } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const patientId = params.id
  const patient = patients.find((p) => p.id === patientId)

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  // Get patient's appointments
  const patientAppointments = appointments.filter((a) => a.patient_id === patientId)

  // Enrich appointments with services and payments
  const enrichedAppointments = patientAppointments.map((apt) => {
    const aptServices = appointmentServices
      .filter((as) => as.appointment_id === apt.id)
      .map((as) => {
        const service = services.find((s) => s.id === as.service_id)
        return service
      })
      .filter(Boolean)

    const payment = payments.find((p) => p.appointment_id === apt.id)

    return {
      ...apt,
      services: aptServices,
      payment,
    }
  })

  return NextResponse.json({
    patient,
    appointments: enrichedAppointments,
  })
}
