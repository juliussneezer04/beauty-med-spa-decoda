import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, Mail, Phone, Calendar, TrendingUp } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
          >
            {/* Provider Icon & Name */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-blue-50 p-3">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Appointments</span>
                </div>
                <Skeleton className="mt-1 h-7 w-16" />
              </div>
              <div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>Revenue</span>
                </div>
                <Skeleton className="mt-1 h-7 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
