import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 text-gray-400" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Patient Header */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-2 h-5 w-40" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-1 h-7 w-24" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-1 h-5 w-full max-w-md" />
        </div>
      </div>

      {/* Appointments */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <Skeleton className="mb-6 h-7 w-48" />

        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="mt-1 h-4 w-32" />
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mt-4">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
