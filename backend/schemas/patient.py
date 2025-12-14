"""Patient-related schemas."""

from datetime import datetime
from pydantic import BaseModel


class PatientResponse(BaseModel):
    """Schema for patient data in API responses."""

    id: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    source: str
    address: str
    phone: str
    email: str
    created_date: str

    class Config:
        from_attributes = True


class ServiceResponse(BaseModel):
    """Schema for service data."""

    id: str
    name: str
    description: str
    price: int
    duration: int
    created_date: str

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    """Schema for payment data."""

    id: str
    appointment_id: str
    amount: int
    payment_date: str
    created_date: str

    class Config:
        from_attributes = True


class AppointmentWithServices(BaseModel):
    """Schema for appointment with its services and payment."""

    id: str
    patient_id: str
    status: str
    created_date: str
    services: list[ServiceResponse]
    payment: PaymentResponse | None

    class Config:
        from_attributes = True


class PatientDetailResponse(BaseModel):
    """Schema for detailed patient view with appointments."""

    patient: PatientResponse
    appointments: list[AppointmentWithServices]


class PatientListResponse(BaseModel):
    """Schema for paginated patient list."""

    data: list[PatientResponse]
    nextCursor: str | None
    hasMore: bool
    total: int

