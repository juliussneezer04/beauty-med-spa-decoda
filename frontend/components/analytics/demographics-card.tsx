"use client";

import { Fragment, memo, ReactNode } from "react";
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
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Patient Demographics
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Gender Distribution
          </h3>
          <Skeleton className="mx-auto h-[250px] w-full max-w-[250px] rounded-full" />
        </div>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-600">
            Age Distribution
          </h3>
          <Skeleton className="h-[250px] w-full" />
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

  // Find majority gender
  const majorityGender = genderData.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );

  // Find top 2 age ranges
  const sortedAgeData = [...ageData].sort((a, b) => b.value - a.value);
  const topAgeRanges = sortedAgeData.slice(0, 2);

  // Helper function to parse age range (e.g., "35-44" -> { start: 35, end: 44 })
  const parseAgeRange = (
    range: string
  ): { start: number; end: number } | null => {
    const match = range.match(/(\d+)-(\d+)/);
    if (!match) return null;
    return { start: parseInt(match[1]), end: parseInt(match[2]) };
  };

  // Format age ranges subtitle
  const formatAgeSubtitle = (): ReactNode => {
    if (topAgeRanges.length === 0) {
      return <Fragment></Fragment>;
    }
    if (topAgeRanges.length === 1) {
      return (
        <Fragment>
          Most patients are <b>{topAgeRanges[0].name}</b> years old
        </Fragment>
      );
    }

    const range1 = parseAgeRange(topAgeRanges[0].name);
    const range2 = parseAgeRange(topAgeRanges[1].name);

    if (!range1 || !range2) {
      return (
        <Fragment>
          Most patients are either <b>{topAgeRanges[0].name}</b> or{" "}
          <b>{topAgeRanges[1].name}</b> years old
        </Fragment>
      );
    }

    // Check if ranges are consecutive
    const isConsecutive =
      range1.end + 1 === range2.start || range2.end + 1 === range1.start;

    if (isConsecutive) {
      // Consecutive: combine them (always use the smaller start and larger end)
      const combinedStart = Math.min(range1.start, range2.start);
      const combinedEnd = Math.max(range1.end, range2.end);
      return (
        <Fragment>
          Most patients are{" "}
          <b>
            {combinedStart}-{combinedEnd}
          </b>{" "}
          years old
        </Fragment>
      );
    } else {
      // Not consecutive: use "either...or"
      return (
        <Fragment>
          Most patients are either <b>{topAgeRanges[0].name}</b> or{" "}
          <b>{topAgeRanges[1].name}</b> years old
        </Fragment>
      );
    }
  };

  const ageSubtitle = formatAgeSubtitle();

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
          <p className="mt-2 text-center text-xs text-gray-500">
            Insight: Majority of your patients are{" "}
            <b>{majorityGender.name.toLowerCase()}</b>
          </p>
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
          {ageSubtitle && (
            <p className="mt-2 text-center text-bold text-xs text-gray-500">
              Insight: {ageSubtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
