"""
Cache Metrics Module

This module provides utilities for tracking and reporting cache metrics.
It can be used to monitor the effectiveness of your caching strategy.
"""
from db.redis_config import get_redis_client
import time
from typing import Dict, Any

# Constants for cache metrics
CACHE_NAMESPACE = "cache:metrics"
HITS_KEY = f"{CACHE_NAMESPACE}:hits"
MISSES_KEY = f"{CACHE_NAMESPACE}:misses"
ENDPOINTS_KEY = f"{CACHE_NAMESPACE}:endpoints"

def record_cache_hit(endpoint: str = None) -> None:
    """
    Record a cache hit
    
    Args:
        endpoint: Optional endpoint that was hit
    """
    redis = get_redis_client()
    if not redis:
        return
    
    # Increment global hits counter
    redis.incr(HITS_KEY)
    
    # If endpoint is provided, increment endpoint-specific counter
    if endpoint:
        redis.incr(f"{ENDPOINTS_KEY}:{endpoint}:hits")
        
        # Add to set of endpoints
        redis.sadd(ENDPOINTS_KEY, endpoint)

def record_cache_miss(endpoint: str = None) -> None:
    """
    Record a cache miss
    
    Args:
        endpoint: Optional endpoint that was missed
    """
    redis = get_redis_client()
    if not redis:
        return
    
    # Increment global misses counter
    redis.incr(MISSES_KEY)
    
    # If endpoint is provided, increment endpoint-specific counter
    if endpoint:
        redis.incr(f"{ENDPOINTS_KEY}:{endpoint}:misses")
        
        # Add to set of endpoints
        redis.sadd(ENDPOINTS_KEY, endpoint)

def get_cache_stats() -> Dict[str, Any]:
    """
    Get cache hit/miss statistics
    
    Returns:
        Dictionary of cache statistics
    """
    redis = get_redis_client()
    if not redis:
        return {"error": "Redis not available"}
    
    # Get global stats
    hits = int(redis.get(HITS_KEY) or 0)
    misses = int(redis.get(MISSES_KEY) or 0)
    total = hits + misses
    
    # Calculate hit rate
    hit_rate = hits / total if total > 0 else 0
    
    # Get all endpoints
    endpoints = redis.smembers(ENDPOINTS_KEY) or []
    
    # Get endpoint-specific stats
    endpoint_stats = {}
    for endpoint in endpoints:
        endpoint_hits = int(redis.get(f"{ENDPOINTS_KEY}:{endpoint}:hits") or 0)
        endpoint_misses = int(redis.get(f"{ENDPOINTS_KEY}:{endpoint}:misses") or 0)
        endpoint_total = endpoint_hits + endpoint_misses
        endpoint_hit_rate = endpoint_hits / endpoint_total if endpoint_total > 0 else 0
        
        endpoint_stats[endpoint] = {
            "hits": endpoint_hits,
            "misses": endpoint_misses,
            "total": endpoint_total,
            "hit_rate": endpoint_hit_rate
        }
    
    return {
        "global": {
            "hits": hits,
            "misses": misses,
            "total": total,
            "hit_rate": hit_rate
        },
        "endpoints": endpoint_stats
    }

def clear_cache_stats() -> bool:
    """
    Clear all cache statistics
    
    Returns:
        bool: Success status
    """
    redis = get_redis_client()
    if not redis:
        return False
    
    # Get all endpoint keys
    endpoints = redis.smembers(ENDPOINTS_KEY) or []
    
    # Create list of keys to delete
    keys_to_delete = [HITS_KEY, MISSES_KEY, ENDPOINTS_KEY]
    for endpoint in endpoints:
        keys_to_delete.append(f"{ENDPOINTS_KEY}:{endpoint}:hits")
        keys_to_delete.append(f"{ENDPOINTS_KEY}:{endpoint}:misses")
    
    # Delete all keys
    redis.delete(*keys_to_delete)
    
    return True

def time_function(func):
    """
    Decorator to time a function's execution
    
    Args:
        func: Function to time
    """
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # Record execution time in Redis
        redis = get_redis_client()
        if redis:
            function_name = func.__name__
            execution_time = end_time - start_time
            
            # Store execution time in Redis
            redis.lpush(f"{CACHE_NAMESPACE}:times:{function_name}", execution_time)
            
            # Trim list to last 100 executions
            redis.ltrim(f"{CACHE_NAMESPACE}:times:{function_name}", 0, 99)
        
        return result
    
    return wrapper
