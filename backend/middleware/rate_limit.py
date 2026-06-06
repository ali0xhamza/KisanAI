# backend/middleware/rate_limit.py
from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

# ── In-memory rate limit store ────────────────────────────────────
# Format: { "ip_or_userid": [(timestamp1), (timestamp2), ...] }
request_store = defaultdict(list)

# ── Rate Limit Config ─────────────────────────────────────────────
LIMITS = {
    "ai":       {"requests": 20,  "window": 60},   # 20 req/minute
    "auth":     {"requests": 5,   "window": 60},   # 5 req/minute (login/register)
    "general":  {"requests": 100, "window": 60},   # 100 req/minute
}

def get_identifier(request: Request) -> str:
    """User ki identity — IP address use karo"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host or "unknown"

def check_rate_limit(identifier: str, limit_type: str = "general"):
    """Rate limit check karo — exceed par 429 throw karo"""
    config = LIMITS.get(limit_type, LIMITS["general"])
    max_requests = config["requests"]
    window_secs  = config["window"]

    now     = datetime.now()
    cutoff  = now - timedelta(seconds=window_secs)
    key     = f"{limit_type}:{identifier}"

    # Purane requests clean karo
    request_store[key] = [t for t in request_store[key] if t > cutoff]

    # Check karo
    if len(request_store[key]) >= max_requests:
        retry_after = window_secs - (now - request_store[key][0]).seconds
        raise HTTPException(
            status_code=429,
            detail={
                "error":       "Bohot zyada requests! Thoda ruko.",
                "retry_after": max(retry_after, 1),
                "limit":       max_requests,
                "window":      f"{window_secs} seconds",
            }
        )

    # Request record karo
    request_store[key].append(now)

# ── Dependency functions — routes mein use karo ───────────────────
def ai_rate_limit(request: Request):
    identifier = get_identifier(request)
    check_rate_limit(identifier, "ai")

def auth_rate_limit(request: Request):
    identifier = get_identifier(request)
    check_rate_limit(identifier, "auth")

def general_rate_limit(request: Request):
    identifier = get_identifier(request)
    check_rate_limit(identifier, "general")