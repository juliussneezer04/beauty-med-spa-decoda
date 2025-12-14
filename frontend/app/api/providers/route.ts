import { NextResponse } from "next/server"
import { providers, appointmentServices, payments, appointments, getProviderSpecialty } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint with cursor-based pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""

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
  let providerData = Object.entries(providerStats).map(([providerId, stats]) => {
    const provider = providers.find((p) => p.id === providerId)
    return {
      id: providerId,
      name: provider ? `${provider.first_name} ${provider.last_name}` : "Unknown",
      email: provider?.email || "",
      phone: provider?.phone || "",
      specialty: getProviderSpecialty(providerId),
      appointmentCount: stats.appointmentCount,
      revenue: stats.revenue,
    }
  })

  // Sort by appointment count
  providerData.sort((a, b) => b.appointmentCount - a.appointmentCount)

  // Filter by search
  if (search) {
    providerData = providerData.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.specialty.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Apply cursor-based pagination
  let startIndex = 0
  if (cursor) {
    startIndex = providerData.findIndex((p) => p.id === cursor) + 1
  }

  const paginatedData = providerData.slice(startIndex, startIndex + limit)
  const nextCursor = paginatedData.length === limit ? paginatedData[paginatedData.length - 1].id : null

  return NextResponse.json({
    data: paginatedData,
    nextCursor,
    hasMore: nextCursor !== null,
  })
}
