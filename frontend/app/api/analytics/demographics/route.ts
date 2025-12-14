import { NextResponse } from "next/server"
import { patients, calculateAge } from "@/lib/mock-data"

// TODO: Replace with actual backend API endpoint
export async function GET() {
  // Gender distribution
  const genderCounts = patients.reduce(
    (acc, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Age distribution
  const ageBuckets = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56-65": 0,
    "65+": 0,
  }

  patients.forEach((p) => {
    const age = calculateAge(p.date_of_birth)
    if (age >= 18 && age <= 25) ageBuckets["18-25"]++
    else if (age >= 26 && age <= 35) ageBuckets["26-35"]++
    else if (age >= 36 && age <= 45) ageBuckets["36-45"]++
    else if (age >= 46 && age <= 55) ageBuckets["46-55"]++
    else if (age >= 56 && age <= 65) ageBuckets["56-65"]++
    else if (age > 65) ageBuckets["65+"]++
  })

  return NextResponse.json({
    totalPatients: patients.length,
    genderDistribution: genderCounts,
    ageDistribution: ageBuckets,
  })
}
