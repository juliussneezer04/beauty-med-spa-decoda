"""Analytics API routes."""

from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

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
    ServiceByRevenueResponse,
    ServiceByBookingsResponse,
    PatientAnalyticsResponse,
    BusinessAnalyticsResponse,
    TopProviderResponse,
    ProviderAnalyticsResponse,
    PatientBehaviorResponse,
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
        "65-75": (65, 75),
        "75+": (75, None),
    }

    # Build CASE statement for age ranges
    age_case = case(
        (
            (Patient.date_of_birth <= datetime(today.year - 0, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 17 - 1, today.month, today.day)
            ),
            "0-17",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 18, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 24 - 1, today.month, today.day)
            ),
            "18-24",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 25, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 34 - 1, today.month, today.day)
            ),
            "25-34",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 35, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 44 - 1, today.month, today.day)
            ),
            "35-44",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 45, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 54 - 1, today.month, today.day)
            ),
            "45-54",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 55, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 64 - 1, today.month, today.day)
            ),
            "55-64",
        ),
        (
            (Patient.date_of_birth <= datetime(today.year - 65, today.month, today.day))
            & (
                Patient.date_of_birth
                > datetime(today.year - 75 - 1, today.month, today.day)
            ),
            "65-75",
        ),
        (
            Patient.date_of_birth <= datetime(today.year - 75, today.month, today.day),
            "75+",
        ),
        else_=None,
    )

    # Single query to get all age distribution counts
    age_counts = (
        db.query(age_case.label("age_range"), func.count(Patient.id))
        .filter(Patient.date_of_birth.isnot(None))
        .group_by(age_case)
        .all()
    )

    # Initialize all ranges to 0, then update with actual counts
    age_distribution = {range_name: 0 for range_name in age_ranges.keys()}
    age_distribution.update(
        {range_name: count for range_name, count in age_counts if range_name}
    )

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
    # Top 10 services by revenue: Service JOIN Payment, SUM(amount), GROUP BY service_id, ORDER DESC
    top_by_revenue_query = (
        db.query(
            Service.id,
            Service.name,
            func.sum(Payment.amount).label("revenue"),
        )
        .join(Payment, Service.id == Payment.service_id)
        .filter(Payment.status == "paid")
        .group_by(Service.id, Service.name)
        .order_by(func.sum(Payment.amount).desc())
        .limit(10)
        .all()
    )

    top_services_by_revenue = [
        ServiceByRevenueResponse(id=service_id, name=name, revenue=revenue)
        for service_id, name, revenue in top_by_revenue_query
    ]

    # Top 10 services by bookings: Service INNER JOIN AppointmentService, COUNT(*), GROUP BY service_id, ORDER DESC
    top_by_bookings_query = (
        db.query(
            Service.id,
            Service.name,
            func.count(AppointmentService.appointment_id).label("count"),
        )
        .join(AppointmentService, Service.id == AppointmentService.service_id)
        .group_by(Service.id, Service.name)
        .order_by(func.count(AppointmentService.appointment_id).desc())
        .limit(10)
        .all()
    )

    top_services_by_bookings = [
        ServiceByBookingsResponse(id=service_id, name=name, count=count)
        for service_id, name, count in top_by_bookings_query
    ]

    # Total revenue (paid payments only)
    total_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.status == "paid")
        .scalar()
    )

    # Total customers count
    total_customers = (
        db.query(func.count(func.distinct(Payment.patient_id)))
        .filter(Payment.status == "paid")
        .scalar()
    )

    # Average payment per
    average_payment = total_revenue // total_customers if total_customers > 0 else 0

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
        topServicesByRevenue=top_services_by_revenue,
        topServicesByBookings=top_services_by_bookings,
        totalRevenue=total_revenue,
        averagePayment=average_payment,
        totalCustomers=total_customers,
        statusDistribution=status_distribution,
        avgServicesPerAppointment=avg_services_per_appointment,
        appointmentsByDay=appointments_by_day_dict,
        totalAppointments=total_appointments,
    )


@router.get("/providers", response_model=ProviderAnalyticsResponse)
def get_provider_analytics(db: Session = Depends(get_db)):
    """
    Get top 5 busiest providers by appointment count.
    """
    # Subquery for appointment count per provider
    appointment_count_subq = (
        db.query(
            AppointmentService.provider_id,
            func.count(func.distinct(AppointmentService.appointment_id)).label(
                "appointment_count"
            ),
        )
        .group_by(AppointmentService.provider_id)
        .subquery()
    )

    # Subquery for revenue per provider (sum of paid payments)
    revenue_subq = (
        db.query(
            Payment.provider_id,
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .filter(Payment.status == "paid")
        .group_by(Payment.provider_id)
        .subquery()
    )

    # Main query with joins - get top 5 by appointment count
    top_providers_query = (
        db.query(
            Provider,
            func.coalesce(appointment_count_subq.c.appointment_count, 0).label(
                "appointment_count"
            ),
            func.coalesce(revenue_subq.c.revenue, 0).label("revenue"),
        )
        .outerjoin(
            appointment_count_subq,
            Provider.id == appointment_count_subq.c.provider_id,
        )
        .outerjoin(revenue_subq, Provider.id == revenue_subq.c.provider_id)
        .order_by(
            func.coalesce(appointment_count_subq.c.appointment_count, 0).desc(),
            Provider.id.asc(),
        )
        .limit(5)
        .all()
    )

    top_providers = [
        TopProviderResponse(
            id=provider.id,
            name=f"{provider.first_name} {provider.last_name}",
            email=provider.email,
            phone=provider.phone,
            appointmentCount=appointment_count,
            revenue=revenue,
        )
        for provider, appointment_count, revenue in top_providers_query
    ]

    return ProviderAnalyticsResponse(topProviders=top_providers)


@router.get("/patient-behavior", response_model=PatientBehaviorResponse)
def get_patient_behavior_analytics(db: Session = Depends(get_db)):
    """
    Get patient behavior patterns including:
    - Distribution of patients by number of appointments (all statuses)
    - Top services booked by patients (all appointments)
    """
    # Count all appointments per patient (any status)
    appointments_per_patient = (
        db.query(
            Appointment.patient_id,
            func.count(Appointment.id).label("appointment_count"),
        )
        .group_by(Appointment.patient_id)
        .subquery()
    )

    # Get all patients with their appointment counts (including patients with 0 appointments)
    patients_with_appointment_counts = (
        db.query(
            Patient.id,
            func.coalesce(appointments_per_patient.c.appointment_count, 0).label(
                "appointment_count"
            ),
        )
        .outerjoin(
            appointments_per_patient, Patient.id == appointments_per_patient.c.patient_id
        )
        .subquery()
    )

    # Categorize patients by appointment count ranges
    appointment_count_case = case(
        (patients_with_appointment_counts.c.appointment_count == 0, "0"),
        (patients_with_appointment_counts.c.appointment_count == 1, "1"),
        (patients_with_appointment_counts.c.appointment_count == 2, "2"),
        (patients_with_appointment_counts.c.appointment_count == 3, "3"),
        (patients_with_appointment_counts.c.appointment_count == 4, "4"),
        (patients_with_appointment_counts.c.appointment_count == 5, "5"),
        (patients_with_appointment_counts.c.appointment_count >= 6, "6+"),
        else_=None,
    )

    # Get distribution of patients by appointment count
    patients_by_appointment_count_query = (
        db.query(
            appointment_count_case.label("appointment_count_range"),
            func.count(patients_with_appointment_counts.c.id).label("patient_count"),
        )
        .group_by(appointment_count_case)
        .all()
    )

    # Initialize all ranges to 0, then update with actual counts
    appointment_count_ranges = ["0", "1", "2", "3", "4", "5", "6+"]
    patients_by_appointment_count = {
        range_name: 0 for range_name in appointment_count_ranges
    }
    patients_by_appointment_count.update(
        {
            range_name: patient_count
            for range_name, patient_count in patients_by_appointment_count_query
            if range_name
        }
    )

    # Top 10 services by revenue: Service JOIN Payment, SUM(amount), GROUP BY service_id, ORDER DESC
    top_by_revenue_query = (
        db.query(
            Service.id,
            Service.name,
            func.sum(Payment.amount).label("revenue"),
        )
        .join(Payment, Service.id == Payment.service_id)
        .filter(Payment.status == "paid")
        .group_by(Service.id, Service.name)
        .order_by(func.sum(Payment.amount).desc())
        .limit(10)
        .all()
    )

    top_services_by_revenue = [
        ServiceByRevenueResponse(id=service_id, name=name, revenue=revenue)
        for service_id, name, revenue in top_by_revenue_query
    ]

    # Top 10 services by bookings: Service INNER JOIN AppointmentService, COUNT(*), GROUP BY service_id, ORDER DESC
    top_by_bookings_query = (
        db.query(
            Service.id,
            Service.name,
            func.count(AppointmentService.appointment_id).label("count"),
        )
        .join(AppointmentService, Service.id == AppointmentService.service_id)
        .group_by(Service.id, Service.name)
        .order_by(func.count(AppointmentService.appointment_id).desc())
        .limit(10)
        .all()
    )

    top_services_by_bookings = [
        ServiceByBookingsResponse(id=service_id, name=name, count=count)
        for service_id, name, count in top_by_bookings_query
    ]

    return PatientBehaviorResponse(
        patientsByAppointmentCount=patients_by_appointment_count,
        topServicesByRevenue=top_services_by_revenue,
        topServicesByBookings=top_services_by_bookings,
    )
