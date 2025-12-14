"use client";

import Link from "next/link";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { calculateAge } from "@/lib/mock-data";
import { usePatients } from "@/hooks/use-patients";

interface SortIconProps {
  column: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

function SortIcon({ column, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== column) {
    return null;
  }
  return sortOrder === "asc" ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );
}

export default function PatientsPage() {
  const {
    patients,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    search,
    genderFilter,
    sourceFilter,
    sortBy,
    sortOrder,
    setSearch,
    setGenderFilter,
    setSourceFilter,
    handleSort,
    loadMore,
  } = usePatients({ initialLimit: 50 });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-3xl font-semibold text-transparent">
          Patients
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and view all patient records ({total} total)
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Sources</option>
            <option value="in_person">In Person</option>
            <option value="phone">Phone</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="google">Google</option>
            <option value="website">Website</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 shadow-sm backdrop-blur-sm">
        {loading && patients.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-500">Loading patients...</div>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-500">No patients found</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    <th
                      className="cursor-pointer px-6 py-4 hover:text-blue-600"
                      onClick={() => handleSort("first_name")}
                    >
                      <div className="flex items-center gap-1">
                        Name{" "}
                        <SortIcon
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          column="first_name"
                        />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 hover:text-blue-600"
                      onClick={() => handleSort("date_of_birth")}
                    >
                      <div className="flex items-center gap-1">
                        Age{" "}
                        <SortIcon
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          column="date_of_birth"
                        />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 hover:text-blue-600"
                      onClick={() => handleSort("gender")}
                    >
                      <div className="flex items-center gap-1">
                        Gender{" "}
                        <SortIcon
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          column="gender"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th
                      className="cursor-pointer px-6 py-4 hover:text-blue-600"
                      onClick={() => handleSort("source")}
                    >
                      <div className="flex items-center gap-1">
                        Source{" "}
                        <SortIcon
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          column="source"
                        />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 hover:text-blue-600"
                      onClick={() => handleSort("created_date")}
                    >
                      <div className="flex items-center gap-1">
                        Created{" "}
                        <SortIcon
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          column="created_date"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="cursor-pointer transition-colors hover:bg-blue-50/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {calculateAge(patient.date_of_birth)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-600">
                          {patient.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {patient.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                          {patient.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(patient.created_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="border-t border-gray-200 p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
