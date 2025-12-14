"use client";

import { AnalyticsProvider } from "@/contexts/analytics-context";
import {
  TotalPatientsCard,
  TotalRevenueCard,
  TotalAppointmentsCard,
  AveragePaymentCard,
  DemographicsCard,
  AcquisitionCard,
  ServicesCard,
  AppointmentsCard,
} from "@/components/analytics";

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-3xl font-semibold text-transparent">
            Spa Analytics Dashboard
          </h1>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TotalPatientsCard />
          <TotalRevenueCard />
          <TotalAppointmentsCard />
          <AveragePaymentCard />
        </div>

        {/* Patient Demographics */}
        <DemographicsCard />

        {/* Patient Acquisition */}
        <AcquisitionCard />

        {/* Services & Revenue */}
        <ServicesCard />

        {/* Appointment Patterns */}
        <AppointmentsCard />
      </div>
    </AnalyticsProvider>
  );
}
