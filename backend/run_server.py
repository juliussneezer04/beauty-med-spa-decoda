#!/usr/bin/env python3
"""
Simple script to run the FastAPI server.
Usage: python run_server.py
"""

import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment variable (Render sets PORT, default to 8000 for local dev)
    port = int(os.environ.get("PORT", 8000))
    # Get host from environment variable (default to 0.0.0.0 for production, 127.0.0.1 for local)
    host = os.environ.get("HOST", "0.0.0.0")
    # Only enable reload in development (when PORT is not set by Render)
    reload = os.environ.get("PORT") is None

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
    )
