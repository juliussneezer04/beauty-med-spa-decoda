import { NextResponse } from "next/server"
import { providers, appointmentServices, payments, appointments, getProviderSpecialty } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET() {
  // Count appointments per provider
  const providerStats = appointmentServices.reduce(
    (acc, as) => {
      if (!acc[as.provider_id]) {
        acc[as.provider_id] = {
          appointmentCount: 0,
          revenue: 0,
        }
      }
      acc[as.provider_id].appointmentCount++

      // Add revenue from appointments
      const appointment = appointments.find((a) => a.id === as.appointment_id)
      if (appointment) {
        const payment = payments.find((p) => p.appointment_id === appointment.id)
        if (payment) {
          acc[as.provider_id].revenue += payment.amount
        }
      }

      return acc
    },
    {} as Record<string, { appointmentCount: number; revenue: number }>,
  )

  // Get provider details
  const providerData = Object.entries(providerStats).map(([providerId, stats]) => {
    const provider = providers.find((p) => p.id === providerId)
    return {
      id: providerId,
      name: provider ? `${provider.first_name} ${provider.last_name}` : "Unknown",
      specialty: getProviderSpecialty(providerId),
      appointmentCount: stats.appointmentCount,
      revenue: stats.revenue,
    }
  })

  return NextResponse.json({
    providers: providerData.sort((a, b) => b.appointmentCount - a.appointmentCount),
  })
}
