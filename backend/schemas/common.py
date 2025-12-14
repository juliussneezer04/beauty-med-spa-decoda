"""Common schemas used across the API."""

from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""

    data: list[T]
    nextCursor: str | None
    hasMore: bool
    total: int

