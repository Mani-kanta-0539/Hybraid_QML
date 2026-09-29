"""
api/index.py
==============================================================================
Standard Vercel serverless entrypoint exporting the FastAPI ASGI app instance.
Enables seamless auto-discovery by Vercel Python runtime and services mode.
==============================================================================
"""

import sys
from pathlib import Path

# Ensure root directory is on Python path
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from api.main import app

# Export for ASGI servers (Vercel, Uvicorn, Gunicorn)
__all__ = ["app"]
