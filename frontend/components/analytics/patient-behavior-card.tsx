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
import { formatNumberShort } from "@/lib/utils";

function LoadingPatientBehaviorCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Behavior Patterns
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Patients by Confirmed Appointments
          </h3>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services Booked
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

  // Prepare data for appointments distribution chart
  const appointmentsData = Object.entries(data.patientsByAppointmentCount).map(
    ([name, value], index) => ({
      name:
        name === "6+" ? "6+" : `${name} appointment${name === "1" ? "" : "s"}`,
      value,
      fill: APP_COLORS[index % APP_COLORS.length],
    })
  );

  // Prepare data for top services chart
  const servicesData = data.topServicesByPatients.map((service, index) => ({
    name: service.name,
    count: service.count,
    revenue: service.revenue,
    fill: APP_COLORS[index % APP_COLORS.length],
  }));

  // Find most common appointment count
  const mostCommonAppointmentCount = appointmentsData.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );

  // Find top service
  const topService = servicesData[0];

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Behavior Patterns
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Understanding how patients interact with confirmed appointments and
        which services they prefer
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Patients by Appointment Count */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Patients by Number of Confirmed Appointments
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
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

        {/* Top Services */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top Services Booked by Patients
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
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
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-gray-500">
            Insight: <b>{topService.name}</b> is the most booked service with{" "}
            <b>{formatNumberShort(topService.count)}</b> bookings
          </p>
        </div>
      </div>
    </div>
  );
});
