"""
Script to seed the database with data from JSON files.

This script loads data from the seed_data directory and inserts it into the database
in the correct order to respect foreign key constraints.
"""

from sqlalchemy.orm import Session
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add the backend directory to the path so we can import models
# Get the backend directory (parent of scripts)
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from db.models import (
    Base,
    Patient,
    Provider,
    Service,
    Appointment,
    AppointmentService,
    Payment,
    GenderEnum,
    SourceEnum,
    PaymentMethodEnum,
    PaymentStatusEnum,
    AppointmentStatusEnum,
)
from db.engine import create_sqlalchemy_engine

# Get the project root directory (parent of backend)
PROJECT_ROOT = Path(__file__).parent.parent.parent
SEED_DATA_DIR = PROJECT_ROOT / "seed_data"


def parse_datetime(dt_str: str) -> datetime:
    """Parse datetime string from JSON to datetime object."""
    # Handle different datetime formats
    try:
        # Try parsing with microseconds
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except ValueError:
        # Try parsing without microseconds
        try:
            return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            # Try parsing date only
            return datetime.strptime(dt_str, "%Y-%m-%d")


def load_json_file(filepath: Path) -> list:
    """Load and parse a JSON file."""
    print(f"Loading {filepath.name}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"  ✓ Loaded {len(data)} records")
    return data


def seed_providers(session: Session):
    """Seed Provider table."""
    filepath = SEED_DATA_DIR / "provider.json"
    data = load_json_file(filepath)

    providers = []
    for item in data:
        provider = Provider(
            id=item["id"],
            first_name=item["first_name"],
            last_name=item["last_name"],
            email=item["email"],
            phone=item["phone"],
            created_date=parse_datetime(item["created_date"]),
        )
        providers.append(provider)

    session.add_all(providers)
    session.commit()
    print(f"  ✓ Inserted {len(providers)} providers")


def seed_services(session: Session):
    """Seed Service table."""
    filepath = SEED_DATA_DIR / "service.json"
    data = load_json_file(filepath)

    services = []
    for item in data:
        service = Service(
            id=item["id"],
            name=item["name"],
            description=item["description"],
            price=item["price"],
            duration=item["duration"],
            created_date=parse_datetime(item["created_date"]),
        )
        services.append(service)

    session.add_all(services)
    session.commit()
    print(f"  ✓ Inserted {len(services)} services")


def seed_patients(session: Session):
    """Seed Patient table."""
    filepath = SEED_DATA_DIR / "patient.json"
    data = load_json_file(filepath)

    patients = []
    for item in data:
        patient = Patient(
            id=item["id"],
            first_name=item["first_name"],
            last_name=item["last_name"],
            date_of_birth=parse_datetime(item["date_of_birth"]),
            gender=GenderEnum(item["gender"]),
            address=item["address"],
            phone=item["phone"],
            email=item["email"],
            source=SourceEnum(item["source"]),
            created_date=parse_datetime(item["created_date"]),
        )
        patients.append(patient)

    session.add_all(patients)
    session.commit()
    print(f"  ✓ Inserted {len(patients)} patients")


def seed_appointments(session: Session):
    """Seed Appointment table."""
    filepath = SEED_DATA_DIR / "appointment.json"
    data = load_json_file(filepath)

    appointments = []
    for item in data:
        appointment = Appointment(
            id=item["id"],
            patient_id=item["patient_id"],
            status=AppointmentStatusEnum(item["status"]),
            created_date=parse_datetime(item["created_date"]),
        )
        appointments.append(appointment)

    session.add_all(appointments)
    session.commit()
    print(f"  ✓ Inserted {len(appointments)} appointments")


def seed_appointment_services(session: Session):
    """Seed AppointmentService table."""
    filepath = SEED_DATA_DIR / "appointment_service.json"
    data = load_json_file(filepath)

    appointment_services = []
    for item in data:
        appointment_service = AppointmentService(
            appointment_id=item["appointment_id"],
            service_id=item["service_id"],
            provider_id=item["provider_id"],
            start=parse_datetime(item["start"]),
            end=parse_datetime(item["end"]),
        )
        appointment_services.append(appointment_service)

    session.add_all(appointment_services)
    session.commit()
    print(f"  ✓ Inserted {len(appointment_services)} appointment services")


def seed_payments(session: Session):
    """Seed Payment table."""
    filepath = SEED_DATA_DIR / "payment.json"
    data = load_json_file(filepath)

    payments = []
    for item in data:
        payment = Payment(
            id=item["id"],
            patient_id=item["patient_id"],
            appointment_id=item["appointment_id"],
            provider_id=item["provider_id"],
            service_id=item["service_id"],
            amount=item["amount"],
            date=parse_datetime(item["date"]),
            method=PaymentMethodEnum(item["method"]),
            status=PaymentStatusEnum(item["status"]),
            created_date=parse_datetime(item["created_date"]),
        )
        payments.append(payment)

    session.add_all(payments)
    session.commit()
    print(f"  ✓ Inserted {len(payments)} payments")


def seed_database():
    """Seed all tables in the correct order."""
    engine = create_sqlalchemy_engine()
    print("Starting database seeding...")
    print("=" * 50)

    with Session(engine) as session:
        try:
            # Seed in order to respect foreign key constraints
            # 1. Independent tables first
            seed_providers(session)
            seed_services(session)
            seed_patients(session)

            # 2. Tables that depend on independent tables
            seed_appointments(session)

            # 3. Junction table and final dependent table
            seed_appointment_services(session)
            seed_payments(session)

            print("=" * 50)
            print("✓ Database seeding completed successfully!")
        except Exception as e:
            session.rollback()
            print(f"✗ Error seeding database: {e}")
            import traceback

            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    seed_database()
