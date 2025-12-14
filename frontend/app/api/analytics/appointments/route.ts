import { NextResponse } from "next/server"
import { appointments, appointmentServices } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET() {
  // Status distribution
  const statusCounts = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Services per appointment
  const servicesPerAppointment = appointments.map((apt) => {
    const serviceCount = appointmentServices.filter((as) => as.appointment_id === apt.id).length
    return serviceCount
  })

  const avgServicesPerAppointment =
    servicesPerAppointment.reduce((sum, count) => sum + count, 0) / servicesPerAppointment.length

  // Appointments by day of week
  const dayOfWeekCounts = appointments.reduce(
    (acc, a) => {
      const date = new Date(a.created_date)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      acc[dayName] = (acc[dayName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return NextResponse.json({
    statusDistribution: statusCounts,
    avgServicesPerAppointment: avgServicesPerAppointment.toFixed(2),
    appointmentsByDay: dayOfWeekCounts,
    totalAppointments: appointments.length,
  })
}
