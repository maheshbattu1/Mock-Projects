from typing import Callable
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from db.redis_utils import check_rate_limit

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting API requests
    
    This middleware uses Redis to store request counts and enforce rate limits.
    It can be configured with different limits for different routes or request types.
    """
    
    def __init__(
        self, 
        app: FastAPI, 
        rate_limit: int = 100,  # Default limit per window
        window: int = 60,       # Default window in seconds (1 minute)
    ):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window = window
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for certain paths if needed
        if request.url.path in ["/", "/health"]:
            return await call_next(request)
        
        # Get client IP
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0]
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Create rate limit key
        path_key = request.url.path.replace("/", "_")
        rate_limit_key = f"rate_limit:{client_ip}:{path_key}"
        
        # Check rate limit
        if not check_rate_limit(rate_limit_key, self.rate_limit, self.window):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {self.window} seconds."
                }
            )
        
        # Continue with the request
        return await call_next(request)
