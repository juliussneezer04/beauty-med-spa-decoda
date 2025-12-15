"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatNumberShort } from "@/lib/utils";
import { useBusinessAnalytics } from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_COLORS } from "@/lib/colors";

function LoadingAppointmentsCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Appointment Patterns
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Appointment Status
          </h3>
          <Skeleton className="mx-auto h-[250px] w-full max-w-[250px] rounded-full" />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorAppointmentsCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Appointment Patterns
      </h2>
      <div className="flex h-[250px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

export const AppointmentsCard = memo(function AppointmentsCard() {
  const { data, loading, error } = useBusinessAnalytics();

  if (loading) {
    return <LoadingAppointmentsCard />;
  }

  if (error || !data) {
    return <ErrorAppointmentsCard error={error || "No data available"} />;
  }

  const statusData = Object.entries(data.statusDistribution).map(
    ([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: APP_COLORS[index % APP_COLORS.length],
    })
  );

  // Calculate confirmed appointment percentage
  const confirmedCount = data.statusDistribution.confirmed || 0;
  const confirmedPercentage =
    data.totalAppointments > 0
      ? ((confirmedCount / data.totalAppointments) * 100).toFixed(1)
      : "0.0";
  const isMajorityNonConfirmed = confirmedCount < data.totalAppointments / 2;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Appointment Statistics
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Status Distribution */}
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Appointment Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Stats */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-gray-600">
              Average Services per Appointment
            </p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {data.avgServicesPerAppointment}
            </p>
          </div>
          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="mt-1 text-2xl font-semibold text-purple-600">
              {formatNumberShort(data.totalAppointments)}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        Insight: {isMajorityNonConfirmed ? (
          <>
            The majority of appointments are <b>non-confirmed</b> with only{" "}
            <b>{confirmedPercentage}%</b> confirmed appointments (
            {formatNumberShort(confirmedCount)} out of{" "}
            {formatNumberShort(data.totalAppointments)})
          </>
        ) : (
          <>
            <b>{confirmedPercentage}%</b> of appointments are confirmed (
            {formatNumberShort(confirmedCount)} out of{" "}
            {formatNumberShort(data.totalAppointments)})
          </>
        )}
        .
      </p>
    </div>
  );
});
