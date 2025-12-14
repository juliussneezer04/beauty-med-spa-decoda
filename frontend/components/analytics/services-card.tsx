"use client";

import { Fragment, memo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { formatCurrency, formatNumberShort } from "@/lib/utils";
import { useBusinessAnalytics } from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingServicesCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Services & Revenue
      </h2>
      <div>
        <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
          Your Top 10 Services by Revenue and Bookings
        </h3>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

function ErrorServicesCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Services & Revenue
      </h2>
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      revenue: number;
      count: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Revenue: {formatCurrency(data.revenue)}
        </p>
        <p className="text-sm text-gray-600">Times Booked: {data.count}</p>
      </div>
    );
  }
  return null;
}

export const ServicesCard = memo(function ServicesCard() {
  const { data, loading, error } = useBusinessAnalytics();

  if (loading) {
    return <LoadingServicesCard />;
  }

  if (error || !data) {
    return <ErrorServicesCard error={error || "No data available"} />;
  }

  const scatterData = data.topServices.map((service) => ({
    name: service.name,
    revenue: service.revenue,
    count: service.count,
  }));

  const scatterDataSortedByCount = [...scatterData].sort(
    (a, b) => b.count - a.count
  );
  const topServiceByCount = scatterDataSortedByCount[0];

  const scatterDataSortedByRevenue = [...scatterData].sort(
    (a, b) => b.revenue - a.revenue
  );
  const topServiceByRevenue = scatterDataSortedByRevenue[0];

  const isSameService = topServiceByCount.name === topServiceByRevenue.name;
  const titleText = isSameService
    ? "Beauty Med Spa's Most Popular (& Profitable) Service"
    : "Beauty Med Spa's Most Popular Service";

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        {titleText}: <b>{topServiceByCount.name}</b>
      </h2>
      <div>
        <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
          Top 10 Services by Revenue and Bookings
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="revenue"
              name="Revenue"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              label={{
                value: "Revenue",
                position: "bottom",
                offset: 20,
                fontSize: 12,
                fill: "#6b7280",
              }}
            />
            <YAxis
              type="number"
              dataKey="count"
              name="Times Booked"
              tick={{ fontSize: 12 }}
              width={60}
              label={{
                value: "Times Booked",
                angle: -90,
                position: "insideLeft",
                dx: -40,
                fontSize: 12,
                fill: "#6b7280",
              }}
            />
            <ZAxis range={[100, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Services" data={scatterData} fill="#0ea5e9" />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-bold text-xs text-gray-500">
          Insight: The most popular service is <b>{topServiceByCount.name}</b>{" "}
          with <b>~{formatNumberShort(topServiceByCount.count)}</b> bookings
          {isSameService ? (
            <Fragment>
              and <b>{formatCurrency(topServiceByCount.revenue, true)}</b> in
              revenue
            </Fragment>
          ) : (
            <Fragment>
              , while the most profitable service is{" "}
              <b>{topServiceByRevenue.name}</b> with{" "}
              <b>~{formatCurrency(topServiceByRevenue.revenue, true)}</b> in
              revenue.
            </Fragment>
          )}
          .
        </p>
      </div>
    </div>
  );
});
