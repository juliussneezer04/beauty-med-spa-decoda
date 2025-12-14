"""Provider-related schemas."""

from pydantic import BaseModel


class ProviderResponse(BaseModel):
    """Schema for provider data in API responses."""

    id: str
    name: str
    email: str
    phone: str
    appointmentCount: int
    revenue: int

    class Config:
        from_attributes = True


class ProviderListResponse(BaseModel):
    """Schema for paginated provider list."""

    data: list[ProviderResponse]
    nextCursor: str | None
    hasMore: bool
    total: int
