import { NextResponse } from "next/server"
import { services, appointmentServices, payments } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET() {
  // Count service usage
  const serviceCounts = appointmentServices.reduce(
    (acc, as) => {
      acc[as.service_id] = (acc[as.service_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate revenue per service
  const serviceRevenue = appointmentServices.reduce(
    (acc, as) => {
      const service = services.find((s) => s.id === as.service_id)
      if (service) {
        acc[as.service_id] = (acc[as.service_id] || 0) + service.price
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Get top services
  const topServices = Object.entries(serviceCounts)
    .map(([serviceId, count]) => {
      const service = services.find((s) => s.id === serviceId)
      return {
        id: serviceId,
        name: service?.name || "Unknown",
        count,
        revenue: serviceRevenue[serviceId] || 0,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Total revenue
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const averagePayment = totalRevenue / payments.length

  return NextResponse.json({
    topServices,
    totalRevenue,
    averagePayment,
    totalPayments: payments.length,
  })
}
