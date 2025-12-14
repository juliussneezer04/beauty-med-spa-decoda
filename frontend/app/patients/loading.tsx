import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Gender Filter */}
          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Source Filter */}
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(10)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
