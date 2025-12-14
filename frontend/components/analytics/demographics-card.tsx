"use client";

import { memo } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { usePatientAnalytics } from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_COLORS } from "@/lib/colors";

function LoadingDemographicsCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <Skeleton className="mb-6 h-7 w-48" />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Skeleton className="mx-auto mb-4 h-4 w-32" />
          <Skeleton className="mx-auto h-[250px] w-full max-w-[250px] rounded-full" />
        </div>
        <div>
          <Skeleton className="mx-auto mb-4 h-4 w-32" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDemographicsCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Demographics
      </h2>
      <div className="flex h-[250px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

export const DemographicsCard = memo(function DemographicsCard() {
  const { data, loading, error } = usePatientAnalytics();

  if (loading) {
    return <LoadingDemographicsCard />;
  }

  if (error || !data) {
    return <ErrorDemographicsCard error={error || "No data available"} />;
  }

  const genderData = Object.entries(data.genderDistribution).map(
    ([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: APP_COLORS[index % APP_COLORS.length],
    })
  );

  const ageData = Object.entries(data.ageDistribution).map(
    ([name, value], index) => ({
      name,
      value,
      fill: APP_COLORS[index % APP_COLORS.length],
    })
  );

  return (
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
  );
});
