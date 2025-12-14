import { type NextRequest, NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"
import type { PaginatedResponse, Patient } from "@/lib/types"

// TODO: Replace with actual backend API endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cursor = searchParams.get("cursor")
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const search = searchParams.get("search")
  const gender = searchParams.get("gender")
  const source = searchParams.get("source")
  const sortBy = searchParams.get("sortBy") || "created_date"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  let filteredPatients = [...patients] as Patient[]

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPatients = filteredPatients.filter(
      (p) =>
        p.first_name.toLowerCase().includes(searchLower) ||
        p.last_name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.phone.includes(search),
    )
  }

  if (gender) {
    filteredPatients = filteredPatients.filter((p) => p.gender === gender)
  }

  if (source) {
    filteredPatients = filteredPatients.filter((p) => p.source === source)
  }

  // Apply sorting
  filteredPatients.sort((a, b) => {
    let aVal = a[sortBy as keyof Patient]
    let bVal = b[sortBy as keyof Patient]

    if (typeof aVal === "string") aVal = aVal.toLowerCase()
    if (typeof bVal === "string") bVal = bVal.toLowerCase()

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  // Cursor-based pagination
  let startIndex = 0
  if (cursor) {
    startIndex = filteredPatients.findIndex((p) => p.id === cursor) + 1
  }

  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < filteredPatients.length
  const nextCursor = hasMore ? paginatedPatients[paginatedPatients.length - 1].id : null

  const response: PaginatedResponse<Patient> = {
    data: paginatedPatients,
    nextCursor,
    hasMore,
    total: filteredPatients.length,
  }

  return NextResponse.json(response)
}
