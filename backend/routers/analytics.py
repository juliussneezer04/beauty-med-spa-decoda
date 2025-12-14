"""Analytics API routes."""

from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.session import get_db
from db.models import (
    Patient,
    Appointment,
    AppointmentService,
    Service,
    Payment,
)
from schemas.analytics import (
    TopServiceResponse,
    PatientAnalyticsResponse,
    BusinessAnalyticsResponse,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/patients", response_model=PatientAnalyticsResponse)
def get_patient_analytics(db: Session = Depends(get_db)):
    """
    Get consolidated patient analytics including demographics and sources.
    """
    # Total patients
    total_patients = db.query(func.count(Patient.id)).scalar()

    # Gender distribution
    gender_counts = (
        db.query(Patient.gender, func.count(Patient.id)).group_by(Patient.gender).all()
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

    # Source distribution
    source_counts = (
        db.query(Patient.source, func.count(Patient.id)).group_by(Patient.source).all()
    )
    source_distribution = {str(source.value): count for source, count in source_counts}

    # Patients by month
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

    return PatientAnalyticsResponse(
        totalPatients=total_patients,
        genderDistribution=gender_distribution,
        ageDistribution=age_distribution,
        sourceDistribution=source_distribution,
        patientsByMonth=patients_by_month_dict,
    )


@router.get("/business", response_model=BusinessAnalyticsResponse)
def get_business_analytics(db: Session = Depends(get_db)):
    """
    Get consolidated business analytics including services and appointments.
    """
    # Top services by count and revenue
    top_services_query = (
        db.query(
            Service.id,
            Service.name,
            func.count(AppointmentService.appointment_id).label("count"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .outerjoin(AppointmentService, Service.id == AppointmentService.service_id)
        .outerjoin(
            Payment,
            (Payment.service_id == Service.id) & (Payment.status == "paid"),
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
        db.query(func.count(Payment.id)).filter(Payment.status == "paid").scalar()
    )

    # Average payment
    average_payment = total_revenue // total_payments if total_payments > 0 else 0

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
    avg_services = total_services / total_appointments if total_appointments > 0 else 0
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

    return BusinessAnalyticsResponse(
        topServices=top_services,
        totalRevenue=total_revenue,
        averagePayment=average_payment,
        totalPayments=total_payments,
        statusDistribution=status_distribution,
        avgServicesPerAppointment=avg_services_per_appointment,
        appointmentsByDay=appointments_by_day_dict,
        totalAppointments=total_appointments,
    )
