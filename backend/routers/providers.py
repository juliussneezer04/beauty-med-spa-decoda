"""Provider API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from db.session import get_db
from db.models import Provider, AppointmentService, Payment
from schemas.provider import ProviderResponse, ProviderListResponse
from utils import encode_cursor, decode_cursor

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("", response_model=ProviderListResponse)
def get_providers(
    cursor: str | None = Query(None, description="Cursor for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    search: str | None = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
):
    """
    Get a paginated list of providers with appointment counts and revenue.
    Uses cursor-based pagination.
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

    # Main query with joins
    query = (
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
    )

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Provider.first_name.ilike(search_term),
                Provider.last_name.ilike(search_term),
                Provider.email.ilike(search_term),
            )
        )

    # Get total count
    total = query.count()

    # Apply cursor-based pagination
    # Sorting by appointment_count DESC, then id ASC for tie-breaking
    if cursor:
        cursor_data = decode_cursor(cursor)
        if cursor_data:
            cursor_count = cursor_data["appointment_count"]
            cursor_id = cursor_data["id"]

            # For descending appointment_count:
            # (count < cursor_count) OR (count = cursor_count AND id > cursor_id)
            query = query.filter(
                or_(
                    func.coalesce(appointment_count_subq.c.appointment_count, 0)
                    < cursor_count,
                    and_(
                        func.coalesce(appointment_count_subq.c.appointment_count, 0)
                        == cursor_count,
                        Provider.id > cursor_id,
                    ),
                )
            )

    # Apply sorting (by appointment count descending, id ascending for tie-breaking)
    query = query.order_by(
        func.coalesce(appointment_count_subq.c.appointment_count, 0).desc(),
        Provider.id.asc(),
    )

    # Fetch one extra to determine if there are more
    results = query.limit(limit + 1).all()

    # Check if there are more results
    has_more = len(results) > limit
    if has_more:
        results = results[:limit]

    # Calculate next cursor from last item
    next_cursor = None
    if has_more and results:
        last_provider, last_count, _ = results[-1]
        next_cursor = encode_cursor(
            {"appointment_count": last_count, "id": last_provider.id}
        )

    # Transform results
    providers = []
    for provider, appointment_count, revenue in results:
        providers.append(
            ProviderResponse(
                id=provider.id,
                name=f"{provider.first_name} {provider.last_name}",
                email=provider.email,
                phone=provider.phone,
                specialty="General",  # Default since not in model
                appointmentCount=appointment_count,
                revenue=revenue,
            )
        )

    return ProviderListResponse(
        data=providers,
        nextCursor=next_cursor,
        hasMore=has_more,
        total=total,
    )
