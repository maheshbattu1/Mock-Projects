from fastapi import APIRouter, Depends, HTTPException
from auth.auth_utils import get_current_user
from auth.admin_utils import check_admin_role
from utils.cache_metrics import get_cache_stats, clear_cache_stats
from db.redis_config import get_redis_client
from models.models import User

router = APIRouter()

@router.get("/stats")
async def get_cache_statistics(current_user: User = Depends(get_current_user)):
    """
    Get cache statistics
    
    This endpoint is only accessible to admin users.
    
    Returns:
        Cache statistics
    """
    # Check if user is admin
    if not check_admin_role(current_user):
        raise HTTPException(status_code=403, detail="Admin role required")
    
    # Get cache statistics
    stats = get_cache_stats()
    
    return stats

@router.post("/clear")
async def clear_cache(current_user: User = Depends(get_current_user)):
    """
    Clear all cache entries
    
    This endpoint is only accessible to admin users.
    
    Returns:
        Success message
    """
    # Check if user is admin
    if not check_admin_role(current_user):
        raise HTTPException(status_code=403, detail="Admin role required")
    
    # Clear cache statistics
    stats_cleared = clear_cache_stats()
    
    # Clear FastAPI cache
    redis = get_redis_client()
    if not redis:
        raise HTTPException(status_code=500, detail="Redis not available")
    
    fastapi_keys = redis.keys("fastapi-cache:*")
    if fastapi_keys:
        redis.delete(*fastapi_keys)
    
    return {"message": "Cache cleared successfully", "stats_cleared": stats_cleared, "fastapi_keys_cleared": len(fastapi_keys)}

@router.get("/keys")
async def list_cache_keys(pattern: str = "*", current_user: User = Depends(get_current_user)):
    """
    List all cache keys matching a pattern
    
    This endpoint is only accessible to admin users.
    
    Args:
        pattern: Pattern to match keys against
        
    Returns:
        List of cache keys
    """
    # Check if user is admin
    if not check_admin_role(current_user):
        raise HTTPException(status_code=403, detail="Admin role required")
    
    # Get Redis client
    redis = get_redis_client()
    if not redis:
        raise HTTPException(status_code=500, detail="Redis not available")
    
    # Get all keys matching pattern
    keys = redis.keys(pattern)
    
    # Get TTL for each key
    result = []
    for key in keys:
        ttl = redis.ttl(key)
        result.append({
            "key": key,
            "ttl": ttl if ttl > -1 else "no expiry" if ttl == -1 else "expired"
        })
    
    return {"keys": result, "total": len(result)}
