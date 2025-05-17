from typing import Any, Optional
import json
from db.redis_config import get_redis_client

# Get Redis client
redis_client = get_redis_client()

# Generic Redis operations
def set_value(key: str, value: Any, expiration: int = None) -> bool:
    """
    Set a key-value pair in Redis
    
    Args:
        key: Redis key
        value: Value to store (will be JSON serialized if not a string)
        expiration: Expiration time in seconds (optional)
        
    Returns:
        bool: Success status
    """
    try:
        if not isinstance(value, str):
            value = json.dumps(value)
        
        if expiration:
            return redis_client.setex(key, expiration, value)
        else:
            return redis_client.set(key, value)
    except Exception as e:
        print(f"Redis set error: {e}")
        return False

def get_value(key: str, default: Any = None) -> Any:
    """
    Get a value from Redis
    
    Args:
        key: Redis key
        default: Default value if key doesn't exist
        
    Returns:
        The value (deserialized from JSON if possible) or default
    """
    try:
        value = redis_client.get(key)
        if value is None:
            return default
        
        # Try to deserialize JSON, return as-is if not JSON
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return value
    except Exception as e:
        print(f"Redis get error: {e}")
        return default

def delete_key(key: str) -> bool:
    """
    Delete a key from Redis
    
    Args:
        key: Redis key
        
    Returns:
        bool: Success status
    """
    try:
        return redis_client.delete(key) > 0
    except Exception as e:
        print(f"Redis delete error: {e}")
        return False

def increment(key: str, amount: int = 1) -> Optional[int]:
    """
    Increment a counter in Redis
    
    Args:
        key: Redis key
        amount: Amount to increment by
        
    Returns:
        int: New value or None on error
    """
    try:
        return redis_client.incrby(key, amount)
    except Exception as e:
        print(f"Redis increment error: {e}")
        return None

# User session management
def store_user_session(user_id: int, token: str, expiration: int = 3600) -> bool:
    """
    Store a user session in Redis
    
    Args:
        user_id: User ID
        token: JWT token
        expiration: Expiration time in seconds (default 1 hour)
        
    Returns:
        bool: Success status
    """
    session_key = f"user_session:{user_id}"
    return set_value(session_key, token, expiration)

def get_user_session(user_id: int) -> Optional[str]:
    """
    Get a user session from Redis
    
    Args:
        user_id: User ID
        
    Returns:
        str: JWT token or None if not found
    """
    session_key = f"user_session:{user_id}"
    return get_value(session_key)

def invalidate_user_session(user_id: int) -> bool:
    """
    Invalidate a user session in Redis
    
    Args:
        user_id: User ID
        
    Returns:
        bool: Success status
    """
    session_key = f"user_session:{user_id}"
    return delete_key(session_key)

# Rate limiting
def check_rate_limit(key: str, limit: int, window: int = 60) -> bool:
    """
    Check if a rate limit has been exceeded
    
    Args:
        key: Rate limit key (e.g., "ip:{ip_address}" or "user:{user_id}")
        limit: Maximum number of requests allowed
        window: Time window in seconds (default 60 seconds)
        
    Returns:
        bool: True if under limit, False if exceeded
    """
    try:
        # Get current count
        count = redis_client.get(key)
        count = int(count) if count else 0
        
        # Check if limit exceeded
        if count >= limit:
            return False
        
        # Increment counter
        if count == 0:
            # First request, set with expiration
            redis_client.setex(key, window, 1)
        else:
            # Increment existing counter
            redis_client.incr(key)
        
        return True
    except Exception as e:
        print(f"Rate limit check error: {e}")
        # Allow request if Redis fails
        return True
