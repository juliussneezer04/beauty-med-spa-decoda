"""Analytics-related schemas."""

from pydantic import BaseModel


class DemographicsResponse(BaseModel):
    """Schema for demographics analytics."""

    totalPatients: int
    genderDistribution: dict[str, int]
    ageDistribution: dict[str, int]


class SourcesResponse(BaseModel):
    """Schema for patient sources analytics."""

    sourceDistribution: dict[str, int]
    patientsByMonth: dict[str, int]


class TopServiceResponse(BaseModel):
    """Schema for top service item."""

    id: str
    name: str
    count: int
    revenue: int


class ServicesAnalyticsResponse(BaseModel):
    """Schema for services analytics."""

    topServices: list[TopServiceResponse]
    totalRevenue: int
    averagePayment: int
    totalPayments: int


class ProviderAnalyticsItem(BaseModel):
    """Schema for provider analytics item."""

    id: str
    name: str
    specialty: str
    appointmentCount: int
    revenue: int


class ProvidersAnalyticsResponse(BaseModel):
    """Schema for providers analytics."""

    providers: list[ProviderAnalyticsItem]


class AppointmentsAnalyticsResponse(BaseModel):
    """Schema for appointments analytics."""

    statusDistribution: dict[str, int]
    avgServicesPerAppointment: str
    appointmentsByDay: dict[str, int]
    totalAppointments: int

