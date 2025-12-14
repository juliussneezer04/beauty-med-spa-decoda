"""Analytics API routes."""

from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from db.session import get_db
from db.models import (
    Patient,
    Appointment,
    AppointmentService,
    Service,
    Payment,
    Provider,
)
from schemas.analytics import (
    DemographicsResponse,
    SourcesResponse,
    ServicesAnalyticsResponse,
    ProvidersAnalyticsResponse,
    AppointmentsAnalyticsResponse,
    TopServiceResponse,
    ProviderAnalyticsItem,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/demographics", response_model=DemographicsResponse)
def get_demographics(db: Session = Depends(get_db)):
    """
    Get patient demographics analytics including total patients,
    gender distribution, and age distribution.
    """
    # Total patients
    total_patients = db.query(func.count(Patient.id)).scalar()

    # Gender distribution
    gender_counts = (
        db.query(Patient.gender, func.count(Patient.id))
        .group_by(Patient.gender)
        .all()
    )
    gender_distribution = {str(gender.value): count for gender, count in gender_counts}

    # Age distribution
    today = date.today()
    age_ranges = {
        "0-17": (0, 17),
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45-54": (45, 54),
        "55-64": (55, 64),
        "65+": (65, 200),
    }

    age_distribution = {}
    for range_name, (min_age, max_age) in age_ranges.items():
        # Calculate birth date range for this age range
        max_birth_date = datetime(today.year - min_age, today.month, today.day)
        min_birth_date = datetime(today.year - max_age - 1, today.month, today.day)

        count = (
            db.query(func.count(Patient.id))
            .filter(
                Patient.date_of_birth <= max_birth_date,
                Patient.date_of_birth > min_birth_date,
            )
            .scalar()
        )
        age_distribution[range_name] = count

    return DemographicsResponse(
        totalPatients=total_patients,
        genderDistribution=gender_distribution,
        ageDistribution=age_distribution,
    )


@router.get("/sources", response_model=SourcesResponse)
def get_sources(db: Session = Depends(get_db)):
    """
    Get patient source analytics including source distribution
    and patients by month.
    """
    # Source distribution
    source_counts = (
        db.query(Patient.source, func.count(Patient.id))
        .group_by(Patient.source)
        .all()
    )
    source_distribution = {str(source.value): count for source, count in source_counts}

    # Patients by month (last 12 months)
    patients_by_month = (
        db.query(
            func.to_char(Patient.created_date, "YYYY-MM").label("month"),
            func.count(Patient.id).label("count"),
        )
        .group_by(func.to_char(Patient.created_date, "YYYY-MM"))
        .order_by(func.to_char(Patient.created_date, "YYYY-MM"))
        .all()
    )
    patients_by_month_dict = {month: count for month, count in patients_by_month}

    return SourcesResponse(
        sourceDistribution=source_distribution,
        patientsByMonth=patients_by_month_dict,
    )


@router.get("/services", response_model=ServicesAnalyticsResponse)
def get_services_analytics(db: Session = Depends(get_db)):
    """
    Get services analytics including top services, total revenue,
    average payment, and total payments.
    """
    # Top services by count and revenue
    top_services_query = (
        db.query(
            Service.id,
            Service.name,
            func.count(AppointmentService.appointment_id).label("count"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .outerjoin(
            AppointmentService, Service.id == AppointmentService.service_id
        )
        .outerjoin(
            Payment,
            (Payment.service_id == Service.id)
            & (Payment.status == "paid"),
        )
        .group_by(Service.id, Service.name)
        .order_by(func.count(AppointmentService.appointment_id).desc())
        .limit(10)
        .all()
    )

    top_services = [
        TopServiceResponse(
            id=service_id,
            name=name,
            count=count,
            revenue=revenue,
        )
        for service_id, name, count, revenue in top_services_query
    ]

    # Total revenue (paid payments only)
    total_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.status == "paid")
        .scalar()
    )

    # Total payments count
    total_payments = (
        db.query(func.count(Payment.id))
        .filter(Payment.status == "paid")
        .scalar()
    )

    # Average payment
    average_payment = total_revenue // total_payments if total_payments > 0 else 0

    return ServicesAnalyticsResponse(
        topServices=top_services,
        totalRevenue=total_revenue,
        averagePayment=average_payment,
        totalPayments=total_payments,
    )


@router.get("/providers", response_model=ProvidersAnalyticsResponse)
def get_providers_analytics(db: Session = Depends(get_db)):
    """
    Get providers analytics including appointment counts and revenue per provider.
    """
    # Provider stats
    providers_query = (
        db.query(
            Provider.id,
            Provider.first_name,
            Provider.last_name,
            func.count(func.distinct(AppointmentService.appointment_id)).label(
                "appointment_count"
            ),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .outerjoin(
            AppointmentService, Provider.id == AppointmentService.provider_id
        )
        .outerjoin(
            Payment,
            (Payment.provider_id == Provider.id) & (Payment.status == "paid"),
        )
        .group_by(Provider.id, Provider.first_name, Provider.last_name)
        .order_by(func.count(func.distinct(AppointmentService.appointment_id)).desc())
        .all()
    )

    providers = [
        ProviderAnalyticsItem(
            id=provider_id,
            name=f"{first_name} {last_name}",
            specialty="General",  # Default since not in model
            appointmentCount=appointment_count,
            revenue=revenue,
        )
        for provider_id, first_name, last_name, appointment_count, revenue in providers_query
    ]

    return ProvidersAnalyticsResponse(providers=providers)


@router.get("/appointments", response_model=AppointmentsAnalyticsResponse)
def get_appointments_analytics(db: Session = Depends(get_db)):
    """
    Get appointments analytics including status distribution,
    average services per appointment, and appointments by day.
    """
    # Status distribution
    status_counts = (
        db.query(Appointment.status, func.count(Appointment.id))
        .group_by(Appointment.status)
        .all()
    )
    status_distribution = {str(status.value): count for status, count in status_counts}

    # Total appointments
    total_appointments = db.query(func.count(Appointment.id)).scalar()

    # Average services per appointment
    total_services = db.query(func.count(AppointmentService.appointment_id)).scalar()
    avg_services = (
        total_services / total_appointments if total_appointments > 0 else 0
    )
    avg_services_per_appointment = f"{avg_services:.2f}"

    # Appointments by day of week
    appointments_by_day = (
        db.query(
            func.to_char(AppointmentService.start, "Day").label("day"),
            func.count(func.distinct(AppointmentService.appointment_id)).label("count"),
        )
        .group_by(func.to_char(AppointmentService.start, "Day"))
        .all()
    )
    appointments_by_day_dict = {
        day.strip(): count for day, count in appointments_by_day
    }

    return AppointmentsAnalyticsResponse(
        statusDistribution=status_distribution,
        avgServicesPerAppointment=avg_services_per_appointment,
        appointmentsByDay=appointments_by_day_dict,
        totalAppointments=total_appointments,
    )

