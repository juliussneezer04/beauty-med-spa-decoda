"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import patients_router, providers_router, analytics_router

# Create FastAPI app
app = FastAPI(
    title="Decoda Health API",
    description="Backend API for Decoda Health patient management system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://beauty-med-spa-decoda.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(patients_router)
app.include_router(providers_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Decoda Health API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
