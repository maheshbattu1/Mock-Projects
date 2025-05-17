from typing import List, Optional, Callable
from functools import wraps
from db.redis_utils import get_value, set_value
# Import our cache metrics module
from utils.cache_metrics import record_cache_hit, record_cache_miss

def redis_cache(expire: int = 300, prefix: str = "graphql"):
    """
    A decorator to cache function results in Redis
    
    Args:
        expire: Cache expiration time in seconds
        prefix: Cache key prefix
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key from function name and arguments
            args_str = ':'.join(str(arg) for arg in args[1:] if arg is not None)  # Skip self
            kwargs_str = ':'.join(f"{k}={v}" for k, v in kwargs.items() if v is not None)
            
            # Build the cache key
            if args_str and kwargs_str:
                key_parts = [prefix, func.__name__, args_str, kwargs_str]
            elif args_str:
                key_parts = [prefix, func.__name__, args_str]
            elif kwargs_str:
                key_parts = [prefix, func.__name__, kwargs_str]
            else:
                key_parts = [prefix, func.__name__]
                
            cache_key = ':'.join(key_parts)
            endpoint = f"{func.__module__}.{func.__name__}"
            
            # Try to get from cache
            cached_result = get_value(cache_key)
            if cached_result is not None:
                # Record cache hit metric
                record_cache_hit(endpoint)
                print(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # If not in cache, execute function and store result
            result = func(*args, **kwargs)
            set_value(cache_key, result, expire)
            
            # Record cache miss metric
            record_cache_miss(endpoint)
            print(f"Cache miss for key: {cache_key}")
            
            return result
        return wrapper
    return decorator
