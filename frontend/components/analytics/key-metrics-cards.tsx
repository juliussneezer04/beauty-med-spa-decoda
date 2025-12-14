"use client";

import { memo } from "react";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumberShort } from "@/lib/utils";
import {
  usePatientAnalytics,
  useBusinessAnalytics,
} from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface LoadingStatCardProps {
  title: string;
  icon: LucideIcon;
}

function LoadingStatCard({ title, icon: Icon }: LoadingStatCardProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <Skeleton className="mt-2 h-9 w-24" />
        </div>
        <div className="rounded-full bg-blue-50 p-3">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

interface ErrorStatCardProps {
  title: string;
  icon: LucideIcon;
  error: string;
}

function ErrorStatCard({ title, icon: Icon, error }: ErrorStatCardProps) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </div>
        <div className="rounded-full bg-red-50 p-3">
          <Icon className="h-6 w-6 text-red-400" />
        </div>
      </div>
    </div>
  );
}

interface DataStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

function DataStatCard({ title, value, icon: Icon }: DataStatCardProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="rounded-full bg-blue-50 p-3">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

export const TotalPatientsCard = memo(function TotalPatientsCard() {
  const { data, loading, error } = usePatientAnalytics();

  if (loading) {
    return <LoadingStatCard title="Total Patients" icon={Users} />;
  }

  if (error || !data) {
    return (
      <ErrorStatCard
        title="Total Patients"
        icon={Users}
        error={error || "No data"}
      />
    );
  }

  return (
    <DataStatCard
      title="Total Patients"
      value={formatNumberShort(data.totalPatients)}
      icon={Users}
    />
  );
});

export const TotalRevenueCard = memo(function TotalRevenueCard() {
  const { data, loading, error } = useBusinessAnalytics();

  if (loading) {
    return <LoadingStatCard title="Total Revenue" icon={DollarSign} />;
  }

  if (error || !data) {
    return (
      <ErrorStatCard
        title="Total Revenue"
        icon={DollarSign}
        error={error || "No data"}
      />
    );
  }

  return (
    <DataStatCard
      title="Total Revenue"
      value={formatCurrency(data.totalRevenue)}
      icon={DollarSign}
    />
  );
});

export const TotalAppointmentsCard = memo(function TotalAppointmentsCard() {
  const { data, loading, error } = useBusinessAnalytics();

  if (loading) {
    return <LoadingStatCard title="Total Appointments" icon={Calendar} />;
  }

  if (error || !data) {
    return (
      <ErrorStatCard
        title="Total Appointments"
        icon={Calendar}
        error={error || "No data"}
      />
    );
  }

  return (
    <DataStatCard
      title="Total Appointments"
      value={formatNumberShort(data.totalAppointments)}
      icon={Calendar}
    />
  );
});

export const AveragePaymentCard = memo(function AveragePaymentCard() {
  const { data, loading, error } = useBusinessAnalytics();

  if (loading) {
    return <LoadingStatCard title="Average Payment" icon={TrendingUp} />;
  }

  if (error || !data) {
    return (
      <ErrorStatCard
        title="Average Payment"
        icon={TrendingUp}
        error={error || "No data"}
      />
    );
  }

  return (
    <DataStatCard
      title="Average Payment"
      value={formatCurrency(data.averagePayment)}
      icon={TrendingUp}
    />
  );
});
