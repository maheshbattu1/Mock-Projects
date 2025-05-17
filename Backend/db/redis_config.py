import os
import redis
from dotenv import load_dotenv
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi import FastAPI

# Load environment variables
load_dotenv()

# Redis connection settings
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Function to get Redis client
def get_redis_client():
    """Create and return a Redis client"""
    try:
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            decode_responses=True,  # Convert bytes to strings
            socket_timeout=2,       # Add timeout to avoid long hangs
            socket_connect_timeout=2
        )
        # Test the connection
        redis_client.ping()
        print("Redis connection successful")
        return redis_client
    except Exception as e:
        print(f"Redis connection error: {e}")
        print("Ensure Redis server is running and configured correctly in .env file")
        return None

# Initialize FastAPI Cache with Redis backend
def init_redis_cache(app: FastAPI):
    """Initialize FastAPI Cache with Redis backend"""
    try:
        redis_client = get_redis_client()
        if redis_client:
            FastAPICache.init(
                RedisBackend(redis_client),
                prefix="fastapi-cache",
            )
            print("Redis cache initialized")
        else:
            print("Failed to initialize Redis cache")
    except Exception as e:
        print(f"Redis cache initialization error: {e}")
