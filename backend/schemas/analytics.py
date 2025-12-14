"""Analytics-related schemas."""

from pydantic import BaseModel


class TopServiceResponse(BaseModel):
    """Schema for top service item."""

    id: str
    name: str
    count: int
    revenue: int


class PatientAnalyticsResponse(BaseModel):
    """Consolidated schema for patient analytics (demographics + sources)."""

    # Demographics
    totalPatients: int
    genderDistribution: dict[str, int]
    ageDistribution: dict[str, int]
    # Sources
    sourceDistribution: dict[str, int]
    patientsByMonth: dict[str, int]


class BusinessAnalyticsResponse(BaseModel):
    """Consolidated schema for business analytics (services + appointments)."""

    # Services
    topServices: list[TopServiceResponse]
    totalRevenue: int
    averagePayment: int
    totalCustomers: int
    # Appointments
    statusDistribution: dict[str, int]
    avgServicesPerAppointment: str
    appointmentsByDay: dict[str, int]
    totalAppointments: int
