"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatNumberShort } from "@/lib/mock-data"
import { Search, User, Mail, Phone, TrendingUp, Calendar } from "lucide-react"

const COLORS = ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const loadProviders = async (cursor?: string | null, searchQuery?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (cursor) params.append("cursor", cursor)
    if (searchQuery) params.append("search", searchQuery)
    params.append("limit", "20")

    // TODO: Replace with actual backend API
    const response = await fetch(`/api/providers?${params.toString()}`)
    const data = await response.json()

    if (cursor) {
      setProviders((prev) => [...prev, ...data.data])
    } else {
      setProviders(data.data)
    }
    setHasMore(data.hasMore)
    setNextCursor(data.nextCursor)
    setLoading(false)
  }

  useEffect(() => {
    loadProviders(null, search)
  }, [search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setProviders([])
    setNextCursor(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-3xl font-semibold text-transparent">
          Providers
        </h1>
        <p className="mt-2 text-gray-600">View and manage all healthcare providers</p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Provider Grid */}
      {loading && providers.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-gray-500">Loading providers...</div>
        </div>
      ) : providers.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-gray-500">No providers found</div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <div
                key={provider.id}
                className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
              >
                {/* Provider Icon & Name */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-blue-50 p-3">
                      {/* TODO: Replace with actual provider photo */}
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      <span
                        className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length] + "20",
                          color: COLORS[index % COLORS.length],
                        }}
                      >
                        {provider.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{provider.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Appointments</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {formatNumberShort(provider.appointmentCount)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>Revenue</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(provider.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={() => loadProviders(nextCursor, search)}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
