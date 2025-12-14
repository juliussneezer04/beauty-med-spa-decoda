"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
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

function LoadingAcquisitionCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <Skeleton className="mb-6 h-7 w-40" />
      <div>
        <Skeleton className="mx-auto mb-4 h-4 w-40" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorAcquisitionCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Acquisition
      </h2>
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

export const AcquisitionCard = memo(function AcquisitionCard() {
  const { data, loading, error } = usePatientAnalytics();

  if (loading) {
    return <LoadingAcquisitionCard />;
  }

  if (error || !data) {
    return <ErrorAcquisitionCard error={error || "No data available"} />;
  }

  const sourceData = Object.entries(data.sourceDistribution).map(
    ([name, value], index) => ({
      name: name
        .split(/[\s-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value,
      fill: APP_COLORS[index % APP_COLORS.length],
    })
  );

  return (
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
  );
});
