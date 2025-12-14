"""Provider API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from db.session import get_db
from db.models import Provider, AppointmentService, Payment
from schemas.provider import ProviderResponse, ProviderListResponse

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

    # Apply sorting (by appointment count descending)
    query = query.order_by(
        func.coalesce(appointment_count_subq.c.appointment_count, 0).desc(),
        Provider.id.asc(),
    )

    # Apply cursor-based pagination
    if cursor:
        try:
            offset = int(cursor)
            query = query.offset(offset)
        except ValueError:
            pass

    # Fetch one extra to determine if there are more
    results = query.limit(limit + 1).all()

    # Check if there are more results
    has_more = len(results) > limit
    if has_more:
        results = results[:limit]

    # Calculate next cursor
    next_cursor = None
    if has_more:
        current_offset = int(cursor) if cursor else 0
        next_cursor = str(current_offset + limit)

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
