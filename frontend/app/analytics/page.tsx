"use client";

import { StatCard } from "@/components/stat-card";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatNumberShort } from "@/lib/mock-data";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";

const COLORS = [
  "#0ea5e9",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export default function AnalyticsPage() {
  const { data, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-500">No analytics data available</div>
      </div>
    );
  }

  const { demographics, sources, services, providers, appointments } = data;

  const genderData = Object.entries(demographics.genderDistribution).map(
    ([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length],
    })
  );

  const ageData = Object.entries(demographics.ageDistribution).map(
    ([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    })
  );

  const sourceData = Object.entries(sources.sourceDistribution).map(
    ([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[index % COLORS.length],
    })
  );

  const statusData = Object.entries(appointments.statusDistribution).map(
    ([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length],
    })
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-3xl font-semibold text-transparent">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Overview of your patient data and business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={formatNumberShort(demographics.totalPatients)}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(services.totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Total Appointments"
          value={formatNumberShort(appointments.totalAppointments)}
          icon={Calendar}
        />
        <StatCard
          title="Average Payment"
          value={formatCurrency(services.averagePayment)}
          icon={TrendingUp}
        />
      </div>

      {/* Patient Demographics */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Patient Demographics
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Gender Distribution */}
          <div>
            <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
              Gender Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
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
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution */}
          <div>
            <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
              Age Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Patient Acquisition */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Patient Acquisition
        </h2>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Patient Source Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services & Revenue */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Services & Revenue
        </h2>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Top 10 Most Popular Services
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={services.topServices}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="#0ea5e9"
                name="Number of Times Booked"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="#a855f7"
                name="Total Revenue"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Provider Performance
          </h2>
          <Link
            href="/providers"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Providers →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                <th className="pb-3">Provider</th>
                <th className="pb-3">Specialty</th>
                <th className="pb-3 text-right">Appointments</th>
                <th className="pb-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {providers.providers
                .slice(0, 10)
                .map((provider, index) => (
                  <tr
                    key={provider.id}
                    className="border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-colors"
                    onClick={() => (window.location.href = "/providers")}
                  >
                    <td className="py-3 font-medium text-gray-900">
                      {provider.name}
                    </td>
                    <td className="py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length] + "20",
                          color: COLORS[index % COLORS.length],
                        }}
                      >
                        {provider.specialty}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {formatNumberShort(provider.appointmentCount)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(provider.revenue)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Patterns */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Appointment Patterns
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
                {appointments.avgServicesPerAppointment}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="mt-1 text-2xl font-semibold text-purple-600">
                {formatNumberShort(appointments.totalAppointments)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
