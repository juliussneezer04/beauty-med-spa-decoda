import { NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET() {
  const sourceCounts = patients.reduce(
    (acc, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // New patients over time (by month)
  const patientsByMonth = patients.reduce(
    (acc, p) => {
      const month = new Date(p.created_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return NextResponse.json({
    sourceDistribution: sourceCounts,
    patientsByMonth,
  })
}
