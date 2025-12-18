"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePatientBehaviorAnalytics } from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_COLORS } from "@/lib/colors";
import { formatCurrency, formatNumberShort } from "@/lib/utils";

function LoadingPatientBehaviorCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Behavior Patterns
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Patients by Appointments
          </h3>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services by Revenue
          </h3>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services by Bookings
          </h3>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorPatientBehaviorCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Behavior Patterns
      </h2>
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

export const PatientBehaviorCard = memo(function PatientBehaviorCard() {
  const { data, loading, error } = usePatientBehaviorAnalytics();

  if (loading) {
    return <LoadingPatientBehaviorCard />;
  }

  if (error || !data) {
    return <ErrorPatientBehaviorCard error={error || "No data available"} />;
  }

  // Guard against stale cached data missing new fields
  if (!data.topServicesByRevenue || !data.topServicesByBookings) {
    return <LoadingPatientBehaviorCard />;
  }

  // Prepare data for appointments distribution chart
  const appointmentsData = Object.entries(data.patientsByAppointmentCount).map(
    ([name, value], index) => ({
      name:
        name === "6+"
          ? "6+"
          : name === "0"
            ? "0 appointments"
            : `${name} appointment${name === "1" ? "" : "s"}`,
      value,
      fill: APP_COLORS[index % APP_COLORS.length],
    })
  );

  // Prepare data for top services by revenue
  const revenueData = data.topServicesByRevenue.map((service, index) => ({
    name: service.name,
    revenue: service.revenue,
    fill: APP_COLORS[index % APP_COLORS.length],
  }));

  // Prepare data for top services by bookings
  const bookingsData = data.topServicesByBookings.map((service, index) => ({
    name: service.name,
    count: service.count,
    fill: APP_COLORS[index % APP_COLORS.length],
  }));

  // Find most common appointment count
  const mostCommonAppointmentCount = appointmentsData.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );

  const topByRevenue = revenueData[0];
  const topByBookings = bookingsData[0];

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Behavior Patterns
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Understanding how patients interact with appointments and which services
        they prefer
      </p>
      <div className="grid gap-8 md:grid-cols-3">
        {/* Patients by Appointment Count */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Patients by Number of Appointments
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatNumberShort(value)}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {appointmentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-gray-500">
            Insight: Most patients have <b>{mostCommonAppointmentCount.name}</b>{" "}
            ({formatNumberShort(mostCommonAppointmentCount.value)} patients)
          </p>
        </div>

        {/* Top Services by Revenue */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, true)}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Service: ${label}`}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-gray-500">
            Insight: <b>{topByRevenue.name}</b> generates{" "}
            <b>{formatCurrency(topByRevenue.revenue, true)}</b>
          </p>
        </div>

        {/* Top Services by Bookings */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services by Bookings
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatNumberShort(value)}
                labelFormatter={(label) => `Service: ${label}`}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {bookingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-gray-500">
            Insight: <b>{topByBookings.name}</b> has{" "}
            <b>{formatNumberShort(topByBookings.count)}</b> bookings
          </p>
        </div>
      </div>
    </div>
  );
});
