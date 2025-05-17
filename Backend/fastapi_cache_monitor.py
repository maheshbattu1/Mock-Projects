"""
FastAPI Cache Monitor

A simpler script focused specifically on monitoring and inspecting FastAPI cache entries.
"""

import json
import time
from db.redis_config import get_redis_client

# FastAPI cache uses a prefix for all cache keys
FASTAPI_CACHE_PREFIX = "fastapi-cache"

def view_cached_endpoints():
    """
    List all cached endpoints in FastAPI's cache system
    """
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    # Get all keys that match the FastAPI cache prefix
    cache_keys = redis.keys(f"{FASTAPI_CACHE_PREFIX}*")
    
    if not cache_keys:
        print("No cached endpoints found")
        return
    
    print(f"\nFound {len(cache_keys)} cached endpoints:")
    print("-" * 50)
    
    for i, key in enumerate(sorted(cache_keys), 1):
        # Get expiration time
        ttl = redis.ttl(key)
        ttl_display = f"{ttl}s" if ttl > 0 else "No expiry" if ttl == -1 else "Expired"
        
        # Extract endpoint path from cache key
        # The format is typically fastapi-cache:[hash]:[path]:[params]
        key_parts = key.split(":")
        endpoint = ":".join(key_parts[2:]) if len(key_parts) > 2 else key
        
        # Get cache size
        value = redis.get(key)
        size = len(value) if value else 0
        
        print(f"{i}. {endpoint} ({size} bytes)")
        print(f"   Key: {key}")
        print(f"   TTL: {ttl_display}")
        print()

def view_cache_hit_stats():
    """
    Display cache hit and miss statistics
    """
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    # For a proper implementation, you would need to track hits and misses in your code
    # This is a placeholder to show how you could retrieve these stats if tracking is implemented
    hits_key = f"{FASTAPI_CACHE_PREFIX}:stats:hits"
    misses_key = f"{FASTAPI_CACHE_PREFIX}:stats:misses"
    
    hits = int(redis.get(hits_key) or 0)
    misses = int(redis.get(misses_key) or 0)
    
    print("\nCache Hit Statistics")
    print("-" * 50)
    print(f"Cache hits: {hits}")
    print(f"Cache misses: {misses}")
    
    if hits + misses > 0:
        hit_rate = hits / (hits + misses)
        print(f"Hit rate: {hit_rate:.2%}")
    else:
        print("No cache statistics available")

def clear_fastapi_cache():
    """
    Clear all FastAPI cache entries
    """
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    cache_keys = redis.keys(f"{FASTAPI_CACHE_PREFIX}*")
    
    if not cache_keys:
        print("No cached endpoints to clear")
        return
    
    confirm = input(f"Are you sure you want to clear all {len(cache_keys)} cached endpoints? (y/n): ")
    if confirm.lower() != 'y':
        print("Operation cancelled")
        return
    
    # Delete all cache keys
    deleted = redis.delete(*cache_keys)
    print(f"Successfully cleared {deleted} cached endpoints")

def view_cached_endpoint_data(pattern="*"):
    """
    View the actual data stored in the cache for endpoints matching a pattern
    """
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    cache_keys = redis.keys(f"{FASTAPI_CACHE_PREFIX}:{pattern}")
    
    if not cache_keys:
        print(f"No cached endpoints found matching: {pattern}")
        return
    
    # If there are too many keys, ask for confirmation
    if len(cache_keys) > 5:
        confirm = input(f"Found {len(cache_keys)} cached endpoints. View all? (y/n): ")
        if confirm.lower() != 'y':
            print("Operation cancelled")
            return
    
    print(f"\nViewing data for {len(cache_keys)} cached endpoints:")
    
    for key in sorted(cache_keys):
        print("\n" + "=" * 50)
        print(f"Key: {key}")
        
        # Get TTL
        ttl = redis.ttl(key)
        ttl_display = f"{ttl}s" if ttl > 0 else "No expiry" if ttl == -1 else "Expired"
        print(f"TTL: {ttl_display}")
        
        # Get and parse cache data
        value = redis.get(key)
        
        if not value:
            print("No data (key exists but value is empty)")
            continue
        
        print("Data size:", len(value), "bytes")
        
        # Try to parse JSON
        try:
            data = json.loads(value)
            print("Data (JSON):")
            print(json.dumps(data, indent=2)[:1000]) # Show first 1000 chars
            if len(json.dumps(data)) > 1000:
                print("... (truncated)")
        except (json.JSONDecodeError, TypeError):
            print("Data (Raw):")
            print(str(value)[:1000]) # Show first 1000 chars
            if len(str(value)) > 1000:
                print("... (truncated)")

def monitor_cache_activity(seconds=30):
    """
    Monitor FastAPI cache activity for a specified number of seconds
    """
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    print(f"\nMonitoring FastAPI cache activity for {seconds} seconds...")
    print("Press Ctrl+C to stop monitoring earlier")
    print("-" * 50)
    
    try:
        # Get initial cache keys
        initial_keys = set(redis.keys(f"{FASTAPI_CACHE_PREFIX}*"))
        initial_count = len(initial_keys)
        
        print(f"Starting with {initial_count} cached endpoints")
        
        # Monitor for specified duration
        start_time = time.time()
        while time.time() - start_time < seconds:
            time.sleep(1)
            
            # Check for new or deleted cache keys
            current_keys = set(redis.keys(f"{FASTAPI_CACHE_PREFIX}*"))
            
            # Identify new cached endpoints
            new_keys = current_keys - initial_keys
            if new_keys:
                for key in new_keys:
                    ttl = redis.ttl(key)
                    print(f"New cache entry: {key} (TTL: {ttl}s)")
            
            # Identify expired/removed endpoints
            deleted_keys = initial_keys - current_keys
            if deleted_keys:
                for key in deleted_keys:
                    print(f"Removed cache entry: {key}")
            
            # Update for next iteration
            initial_keys = current_keys
        
        # Final summary
        final_count = len(redis.keys(f"{FASTAPI_CACHE_PREFIX}*"))
        print("-" * 50)
        print(f"Monitoring complete. Cached endpoints: {initial_count} → {final_count}")
    
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user")

def display_help():
    """Display help information"""
    print("\nFastAPI Cache Monitor Commands:")
    print("------------------------------")
    print("list           - List all cached endpoints")
    print("view <pattern> - View cache data for endpoints matching pattern")
    print("stats          - View cache hit statistics")
    print("monitor <sec>  - Monitor cache activity for specified seconds")
    print("clear          - Clear all FastAPI cache entries")
    print("help           - Show this help")
    print("exit           - Exit the monitor")
    print()

def main():
    """Main function to run the interactive FastAPI cache monitor"""
    print("\n===== FastAPI Cache Monitor =====")
    print("Type 'help' for available commands")
    
    while True:
        try:
            cmd = input("\nfastapi-cache> ").strip()
            
            if not cmd:
                continue
            
            parts = cmd.split()
            command = parts[0].lower()
            args = parts[1:] if len(parts) > 1 else []
            
            if command == "exit":
                break
            elif command == "help":
                display_help()
            elif command == "list":
                view_cached_endpoints()
            elif command == "view":
                pattern = args[0] if args else "*"
                view_cached_endpoint_data(pattern)
            elif command == "stats":
                view_cache_hit_stats()
            elif command == "monitor":
                seconds = int(args[0]) if args and args[0].isdigit() else 30
                monitor_cache_activity(seconds)
            elif command == "clear":
                clear_fastapi_cache()
            else:
                print(f"Unknown command: {command}")
                print("Type 'help' for available commands")
        
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
