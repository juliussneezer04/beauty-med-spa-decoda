"use client";

import { memo } from "react";
import { Users } from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { useProviderAnalytics } from "@/contexts/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingBusiestProvidersCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Busiest Providers
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-full bg-blue-50 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="mb-4 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <div>
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
              <div>
                <Skeleton className="mb-1 h-3 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBusiestProvidersCard({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Busiest Providers
      </h2>
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

export const BusiestProvidersCard = memo(function BusiestProvidersCard() {
  const { data, loading, error } = useProviderAnalytics();

  if (loading) {
    return <LoadingBusiestProvidersCard />;
  }

  if (error || !data) {
    return (
      <ErrorBusiestProvidersCard error={error || "No data available"} />
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Busiest Providers
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Top 5 providers by appointment count
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.topProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
});

