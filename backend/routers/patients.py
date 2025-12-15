"""Patient API routes."""

from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from db.session import get_db
from db.models import Patient, Appointment, AppointmentService, Service, Payment
from schemas.patient import (
    PatientResponse,
    PatientListResponse,
    PatientDetailResponse,
    AppointmentWithServices,
    ServiceResponse,
    PaymentResponse,
)
from utils import encode_cursor, decode_cursor

router = APIRouter(prefix="/api/patients", tags=["patients"])


def patient_to_response(patient: Patient) -> PatientResponse:
    """Convert a Patient model to PatientResponse schema."""
    return PatientResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth.isoformat(),
        gender=patient.gender.value,
        source=patient.source.value,
        address=patient.address,
        phone=patient.phone,
        email=patient.email,
        created_date=patient.created_date.isoformat(),
    )


@router.get("", response_model=PatientListResponse)
def get_patients(
    cursor: str | None = Query(None, description="Cursor for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    search: str | None = Query(None, description="Search by name, email, or phone"),
    gender: str | None = Query(None, description="Filter by gender"),
    source: str | None = Query(None, description="Filter by source"),
    sortBy: str = Query("created_date", description="Field to sort by"),
    sortOrder: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    """
    Get a paginated list of patients with optional filtering and sorting.
    Uses cursor-based pagination for efficient large dataset handling.
    """

    print(f"search: {search}")
    # Base query
    query = db.query(Patient)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term),
                Patient.email.ilike(search_term),
                Patient.phone.ilike(search_term),
            )
        )

    # Apply gender filter
    if gender:
        query = query.filter(Patient.gender == gender)

    # Apply source filter
    if source:
        query = query.filter(Patient.source == source)

    # Get total count (before pagination)
    total = query.count()

    # Get sort column
    sort_column = getattr(Patient, sortBy, Patient.created_date)
    is_desc = sortOrder == "desc"

    # Apply cursor-based pagination
    if cursor:
        cursor_data = decode_cursor(cursor)
        if cursor_data:
            cursor_sort_value = cursor_data["sort_value"]
            cursor_id = cursor_data["id"]

            # For datetime fields, parse the ISO string back
            if sortBy in ["created_date", "date_of_birth"]:
                cursor_sort_value = datetime.fromisoformat(cursor_sort_value)

            # Build cursor condition: (sort_value, id) > (cursor_sort_value, cursor_id)
            # For descending: (sort_value < cursor_sort_value) OR (sort_value = cursor_sort_value AND id < cursor_id)
            # For ascending: (sort_value > cursor_sort_value) OR (sort_value = cursor_sort_value AND id > cursor_id)
            if is_desc:
                query = query.filter(
                    or_(
                        sort_column < cursor_sort_value,
                        and_(sort_column == cursor_sort_value, Patient.id < cursor_id),
                    )
                )
            else:
                query = query.filter(
                    or_(
                        sort_column > cursor_sort_value,
                        and_(sort_column == cursor_sort_value, Patient.id > cursor_id),
                    )
                )

    # Apply sorting
    if is_desc:
        query = query.order_by(sort_column.desc(), Patient.id.desc())
    else:
        query = query.order_by(sort_column.asc(), Patient.id.asc())

    # Fetch one extra to determine if there are more
    patients = query.limit(limit + 1).all()

    # Check if there are more results
    has_more = len(patients) > limit
    if has_more:
        patients = patients[:limit]

    # Calculate next cursor from last item
    next_cursor = None
    if has_more and patients:
        last_patient = patients[-1]
        last_sort_value = getattr(last_patient, sortBy, last_patient.created_date)
        if hasattr(last_sort_value, "isoformat"):
            last_sort_value = last_sort_value.isoformat()
        next_cursor = encode_cursor(
            {"sort_value": str(last_sort_value), "id": last_patient.id}
        )

    return PatientListResponse(
        data=[patient_to_response(p) for p in patients],
        nextCursor=next_cursor,
        hasMore=has_more,
        total=total,
    )


@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient_by_id(
    patient_id: str,
    db: Session = Depends(get_db),
):
    """
    Get detailed patient information including their appointments.
    """
    # Fetch patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Fetch appointments with services and payments
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.created_date.desc())
        .all()
    )

    if not appointments:
        return PatientDetailResponse(
            patient=patient_to_response(patient),
            appointments=[],
        )

    # Get all appointment IDs
    appointment_ids = [appointment.id for appointment in appointments]

    # Fetch all appointment services and services in one query
    appointment_services_data = (
        db.query(AppointmentService, Service)
        .join(Service, AppointmentService.service_id == Service.id)
        .filter(AppointmentService.appointment_id.in_(appointment_ids))
        .all()
    )

    # Fetch all payments in one query
    payments = (
        db.query(Payment).filter(Payment.appointment_id.in_(appointment_ids)).all()
    )

    # Group services by appointment_id
    services_by_appointment = {}
    for appointment_service, service in appointment_services_data:
        if appointment_service.appointment_id not in services_by_appointment:
            services_by_appointment[appointment_service.appointment_id] = []
        services_by_appointment[appointment_service.appointment_id].append(
            ServiceResponse(
                id=service.id,
                name=service.name,
                description=service.description,
                price=service.price,
                duration=service.duration,
                created_date=service.created_date.isoformat(),
            )
        )

    # Group payments by appointment_id (one-to-one relationship)
    payments_by_appointment = {payment.appointment_id: payment for payment in payments}

    # Build response
    appointments_with_services = []
    for appointment in appointments:
        services = services_by_appointment.get(appointment.id, [])

        payment_record = payments_by_appointment.get(appointment.id)
        payment = None
        if payment_record:
            payment = PaymentResponse(
                id=payment_record.id,
                appointment_id=payment_record.appointment_id,
                amount=payment_record.amount,
                payment_date=payment_record.date.isoformat(),
                created_date=payment_record.created_date.isoformat(),
            )

        appointments_with_services.append(
            AppointmentWithServices(
                id=appointment.id,
                patient_id=appointment.patient_id,
                status=appointment.status.value,
                created_date=appointment.created_date.isoformat(),
                services=services,
                payment=payment,
            )
        )

    return PatientDetailResponse(
        patient=patient_to_response(patient),
        appointments=appointments_with_services,
    )
