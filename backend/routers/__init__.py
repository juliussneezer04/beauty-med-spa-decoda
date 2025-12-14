"""API routers."""

from routers.patients import router as patients_router
from routers.providers import router as providers_router
from routers.analytics import router as analytics_router

__all__ = ["patients_router", "providers_router", "analytics_router"]

