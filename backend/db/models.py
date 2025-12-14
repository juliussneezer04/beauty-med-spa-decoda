from datetime import datetime
from typing import List
from sqlalchemy import ForeignKey, String, Integer, DateTime, Enum, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class GenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class SourceEnum(str, enum.Enum):
    IN_PERSON = "in_person"
    PHONE = "phone"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    GOOGLE = "google"
    WEBSITE = "website"


class PaymentMethodEnum(str, enum.Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    CHECK = "check"


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class AppointmentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Patient(Base):
    """
    Represents a patient in the system.

    Patients has a one-to-many relationship with Appointments and Payments.
    The patient_id field is used as a foreign key in other models.
    """

    __tablename__ = "patient"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime)
    gender: Mapped[GenderEnum] = mapped_column(Enum(GenderEnum))
    address: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    source: Mapped[SourceEnum] = mapped_column(Enum(SourceEnum))
    created_date: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    appointments: Mapped[List["Appointment"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Patient(id={self.id!r}, first_name={self.first_name!r}, last_name={self.last_name!r})"


class Provider(Base):
    """
    Represents a provider (doctor, nurse, specialist, etc.).

    Providers has a many-to-many relationship with Appointments and Services through AppointmentService.
    The provider_id field is used as a foreign key in other models.
    """

    __tablename__ = "provider"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    created_date: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    appointment_services: Mapped[List["AppointmentService"]] = relationship(
        back_populates="provider"
    )
    payments: Mapped[List["Payment"]] = relationship(
        back_populates="provider", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Provider(id={self.id!r}, first_name={self.first_name!r}, last_name={self.last_name!r})"


class Service(Base):
    """
    Represents a service that can be provided.

    Services are the billable items in the system. Examples include consultations,
    tests, procedures, etc. Services have a many-to-many relationship with Appointments through the
    AppointmentService model.

    Important:
    - price is stored in cents (e.g., $150.00 = 15000 cents)
    - duration is in minutes
    """

    __tablename__ = "service"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[int] = mapped_column(Integer)  # Price in cents
    duration: Mapped[int] = mapped_column(Integer)  # Duration in minutes
    created_date: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    appointment_services: Mapped[List["AppointmentService"]] = relationship(
        back_populates="service"
    )
    payments: Mapped[List["Payment"]] = relationship(
        back_populates="service", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Service(id={self.id!r}, name={self.name!r}, price={self.price!r})"


class Appointment(Base):
    """
    Represents a appointment.

    An appointment has a many-to-many relationship with Services through AppointmentService.
    Each service in an appointment can have its own provider - see AppointmentService
    for the full list of services and providers associated with an appointment.

    Relationships:
    - Each appointment belongs to one patient (patient_id)
    - An appointment can have multiple AppointmentService entries (many-to-many)
    - Service and provider information is stored in AppointmentService, not here

    Status:
    - "pending": Appointment is scheduled but not yet confirmed
    - "confirmed": Appointment is confirmed and will proceed
    - "cancelled": Appointment has been cancelled
    """

    __tablename__ = "appointment"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient.id"))
    status: Mapped[AppointmentStatusEnum] = mapped_column(
        Enum(AppointmentStatusEnum), index=True
    )
    created_date: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    patient: Mapped["Patient"] = relationship(back_populates="appointments")
    appointment_services: Mapped[List["AppointmentService"]] = relationship(
        back_populates="appointment", cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        back_populates="appointment", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Appointment(id={self.id!r}, patient_id={self.patient_id!r}, status={self.status!r})"


class AppointmentService(Base):
    """
    Represents a many-to-many relationship between Appointments and Services.

    This model allows appointments to have multiple services, each with its own
    provider, start time, and end time. For example, an appointment might include
    a consultation, followed by a blood test, followed by an X-ray.

    Relationships:
    - Links an appointment (appointment_id) to a specific service (service_id)
    - Each service in an appointment can have a different provider (provider_id)
    - Tracks the scheduled time slot (start and end) for each service
    """

    __tablename__ = "appointment_service"
    __table_args__ = ()

    appointment_id: Mapped[str] = mapped_column(
        ForeignKey("appointment.id"), primary_key=True
    )
    service_id: Mapped[str] = mapped_column(ForeignKey("service.id"), primary_key=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("provider.id"))
    start: Mapped[datetime] = mapped_column(DateTime)
    end: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    appointment: Mapped["Appointment"] = relationship(
        back_populates="appointment_services"
    )
    service: Mapped["Service"] = relationship(back_populates="appointment_services")
    provider: Mapped["Provider"] = relationship(back_populates="appointment_services")

    def __repr__(self) -> str:
        return f"AppointmentService(appointment_id={self.appointment_id!r}, service_id={self.service_id!r}, provider_id={self.provider_id!r})"


class Payment(Base):
    """
    Represents a payment transaction for a appointment.

    Payments has a one-to-many relationship with Patients, Providers, and Services.
    Payments has an optional one-to-one relationship with Appointments.
    Note: Not all appointments have payments - some appointments may be unpaid.

    Important:
    - amount is stored in cents (e.g., $100.50 = 10050 cents)
    - status indicates whether the payment was successful, pending, or failed
    - method indicates how the payment was made (card payments are most common)
    - The service_id refers to the primary service for the appointment
    """

    __tablename__ = "payment"
    __table_args__ = (
        # Composite indexes for common analytics queries
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient.id"))
    appointment_id: Mapped[str] = mapped_column(
        ForeignKey("appointment.id"), index=True
    )
    provider_id: Mapped[str] = mapped_column(ForeignKey("provider.id"))
    service_id: Mapped[str] = mapped_column(ForeignKey("service.id"))
    amount: Mapped[int] = mapped_column(Integer)  # Amount in cents
    date: Mapped[datetime] = mapped_column(DateTime)
    method: Mapped[PaymentMethodEnum] = mapped_column(Enum(PaymentMethodEnum))
    status: Mapped[PaymentStatusEnum] = mapped_column(Enum(PaymentStatusEnum))
    created_date: Mapped[datetime] = mapped_column(DateTime)

    # Relationships
    patient: Mapped["Patient"] = relationship(back_populates="payments", cascade="")
    appointment: Mapped["Appointment"] = relationship(back_populates="payments")
    provider: Mapped["Provider"] = relationship(back_populates="payments")
    service: Mapped["Service"] = relationship(back_populates="payments")

    def __repr__(self) -> str:
        return f"Payment(id={self.id!r}, patient_id={self.patient_id!r}, amount={self.amount!r}, status={self.status!r})"
