"use client";

import { User, Mail, Phone, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency, formatNumberShort } from "@/lib/utils";

interface ProviderCardData {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentCount: number;
  revenue: number;
}

interface ProviderCardProps {
  provider: ProviderCardData;
  className?: string;
}

export function ProviderCard({ provider, className = "" }: ProviderCardProps) {
  return (
    <div
      className={`rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${className}`}
    >
      {/* Provider Icon & Name */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-blue-50 p-3">
            <User className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
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
            <span>Generated Income</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatCurrency(provider.revenue)}
          </p>
        </div>
      </div>
    </div>
  );
}

