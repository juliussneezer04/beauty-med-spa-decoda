"""Shared utility functions for the backend."""

import base64
import json


def encode_cursor(cursor_data: dict) -> str:
    """
    Encode cursor data as base64 JSON.

    Args:
        cursor_data: Dictionary containing cursor values (e.g., sort_value, id)

    Returns:
        Base64-encoded string representation of the cursor
    """
    return base64.urlsafe_b64encode(json.dumps(cursor_data).encode()).decode()


def decode_cursor(cursor: str) -> dict | None:
    """
    Decode cursor from base64 JSON.

    Args:
        cursor: Base64-encoded cursor string

    Returns:
        Dictionary containing cursor values, or None if decoding fails
    """
    try:
        return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
    except Exception:
        return None
