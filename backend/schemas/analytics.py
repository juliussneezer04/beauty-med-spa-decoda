"""Analytics-related schemas."""

from pydantic import BaseModel


class ServiceByRevenueResponse(BaseModel):
    """Schema for service ranked by revenue."""

    id: str
    name: str
    revenue: int


class ServiceByBookingsResponse(BaseModel):
    """Schema for service ranked by booking count."""

    id: str
    name: str
    count: int


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

    # Services - separate lists for revenue and bookings
    topServicesByRevenue: list[ServiceByRevenueResponse]
    topServicesByBookings: list[ServiceByBookingsResponse]
    totalRevenue: int
    averagePayment: int
    totalCustomers: int
    # Appointments
    statusDistribution: dict[str, int]
    avgServicesPerAppointment: str
    appointmentsByDay: dict[str, int]
    totalAppointments: int


class TopProviderResponse(BaseModel):
    """Schema for top provider item."""

    id: str
    name: str
    email: str
    phone: str
    appointmentCount: int
    revenue: int


class ProviderAnalyticsResponse(BaseModel):
    """Schema for provider analytics (busiest providers)."""

    topProviders: list[TopProviderResponse]


class PatientBehaviorResponse(BaseModel):
    """Schema for patient behavior analytics."""

    # Distribution of patients by number of appointments (all statuses)
    patientsByAppointmentCount: dict[str, int]
    # Top services - separate lists for revenue and bookings
    topServicesByRevenue: list[ServiceByRevenueResponse]
    topServicesByBookings: list[ServiceByBookingsResponse]
