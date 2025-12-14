"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { formatCurrency, calculateAge } from "@/lib/mock-data";
import { getPatientById } from "@/lib/api";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual backend API endpoint
    getPatientById(params.id as string).then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-500">Loading patient details...</div>
      </div>
    );
  }

  if (!data) {
    return <div>Patient not found</div>;
  }

  const { patient, appointments } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/patients")}
        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </button>

      {/* Patient Header */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="mt-2 text-gray-600">Patient ID: {patient.id}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium capitalize text-blue-700">
            {patient.source}
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Age</p>
            <p className="mt-1 text-lg text-gray-900">
              {calculateAge(patient.date_of_birth)} years
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gender</p>
            <p className="mt-1 text-lg capitalize text-gray-900">
              {patient.gender}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="mt-1 text-lg text-gray-900">{patient.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-lg text-gray-900">{patient.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="mt-1 text-gray-900">{patient.address}</p>
        </div>
      </div>

      {/* Appointments */}
      <div className="rounded-2xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Appointments ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-500">No appointments found</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => (
              <div
                key={apt.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(apt.created_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(apt.created_date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Services */}
                    {apt.services.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-600">
                          Services:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {apt.services.map((service: any) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700"
                            >
                              {service.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${
                        apt.status === "confirmed"
                          ? "bg-green-50 text-green-700"
                          : apt.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {apt.status}
                    </span>

                    {/* Payment */}
                    {apt.payment && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(apt.payment.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
