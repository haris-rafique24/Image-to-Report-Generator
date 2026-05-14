"""
Vercel serverless entry for this folder as its own project.
Mount strips /api so FastAPI routes (/analyze, /health, /) keep working.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from starlette.middleware.base import BaseHTTPMiddleware

_backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_backend_dir))


class StripApiPrefixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if os.environ.get("VERCEL"):
            path = request.scope.get("path", "")
            if path.startswith("/api"):
                suffix = path[4:] or "/"
                if not suffix.startswith("/"):
                    suffix = "/" + suffix
                request.scope["path"] = suffix
                raw = request.scope.get("raw_path")
                if isinstance(raw, (bytes, bytearray)):
                    request.scope["raw_path"] = suffix.encode()
        return await call_next(request)


from main import app  # noqa: E402

if os.environ.get("VERCEL"):
    app.add_middleware(StripApiPrefixMiddleware)
