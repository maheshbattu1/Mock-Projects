"""
Redis Cache Monitor

This script provides utilities to monitor and inspect your Redis cache.
It can be used to view cached keys, inspect their values, and monitor activity.
"""

import time
import json
from db.redis_config import get_redis_client

def display_help():
    """Display help information about available commands"""
    print("\nRedis Cache Monitor Commands:")
    print("------------------------------")
    print("keys <pattern>     - List all keys matching pattern (default: *)")
    print("get <key>          - Get value for a specific key")
    print("ttl <key>          - Get time-to-live for a key (seconds)")
    print("info               - Show Redis server information")
    print("monitor <seconds>  - Monitor Redis activity for specified seconds")
    print("clear <pattern>    - Clear keys matching pattern")
    print("help               - Show this help")
    print("exit               - Exit the monitor")
    print()

def list_keys(pattern="*"):
    """List all keys in Redis matching a pattern"""
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    keys = redis.keys(pattern)
    if not keys:
        print(f"No keys found matching pattern: {pattern}")
        return
    
    print(f"\nFound {len(keys)} keys matching pattern: {pattern}")
    print("-" * 50)
    
    # Group keys by prefix for better organization
    key_groups = {}
    for key in keys:
        prefix = key.split(":")[0] if ":" in key else "other"
        if prefix not in key_groups:
            key_groups[prefix] = []
        key_groups[prefix].append(key)
    
    # Display keys by group
    for prefix, group_keys in key_groups.items():
        print(f"\n{prefix.upper()} ({len(group_keys)} keys):")
        for i, key in enumerate(group_keys, 1):
            ttl = redis.ttl(key)
            ttl_display = f"(TTL: {ttl}s)" if ttl > 0 else "(no expiry)" if ttl == -1 else "(expired)"
            print(f"  {i}. {key} {ttl_display}")

def get_key_value(key):
    """Get and display the value for a specific key"""
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    value = redis.get(key)
    if value is None:
        print(f"Key not found: {key}")
        return
    
    ttl = redis.ttl(key)
    ttl_display = f"{ttl} seconds" if ttl > 0 else "never" if ttl == -1 else "expired"
    
    print(f"\nKey: {key}")
    print(f"TTL: {ttl_display}")
    print("Value type: ", end="")
    
    # Try to parse as JSON for better display
    try:
        parsed = json.loads(value)
        print("JSON")
        print("-" * 50)
        print(json.dumps(parsed, indent=2))
    except (json.JSONDecodeError, TypeError):
        print("String")
        print("-" * 50)
        print(value)

def show_redis_info():
    """Display Redis server information"""
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    info = redis.info()
    
    print("\nRedis Server Information")
    print("-" * 50)
    print(f"Redis version: {info.get('redis_version', 'Unknown')}")
    print(f"Connected clients: {info.get('connected_clients', 'Unknown')}")
    print(f"Memory used: {info.get('used_memory_human', 'Unknown')}")
    print(f"Total keys: {sum(info.get(f'db{i}', {}).get('keys', 0) for i in range(16) if f'db{i}' in info)}")
    print(f"Uptime: {info.get('uptime_in_seconds', 0)} seconds")
    
    # Cache-specific stats if available
    print("\nCache Statistics:")
    print(f"Keyspace hits: {info.get('keyspace_hits', 'Unknown')}")
    print(f"Keyspace misses: {info.get('keyspace_misses', 'Unknown')}")
    
    if info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0) > 0:
        hit_rate = info.get('keyspace_hits', 0) / (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0))
        print(f"Cache hit rate: {hit_rate:.2%}")

def monitor_redis(seconds=10):
    """Monitor Redis activity for a specified number of seconds"""
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    print(f"\nMonitoring Redis for {seconds} seconds...")
    print("Press Ctrl+C to stop monitoring earlier")
    print("-" * 50)
    
    try:
        # Get initial keys and counts
        initial_keys = set(redis.keys("*"))
        initial_count = len(initial_keys)
        
        # Monitor for specified duration
        start_time = time.time()
        while time.time() - start_time < seconds:
            time.sleep(1)
            
            # Check for new or deleted keys
            current_keys = set(redis.keys("*"))
            new_keys = current_keys - initial_keys
            deleted_keys = initial_keys - current_keys
            
            if new_keys:
                print(f"Added keys: {', '.join(new_keys)}")
            
            if deleted_keys:
                print(f"Deleted keys: {', '.join(deleted_keys)}")
            
            # Update initial keys
            initial_keys = current_keys
        
        # Final summary
        final_count = len(redis.keys("*"))
        print("-" * 50)
        print(f"Monitoring complete. Key count: {initial_count} → {final_count}")
    
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user")

def clear_keys(pattern):
    """Clear all keys matching a pattern"""
    redis = get_redis_client()
    if not redis:
        print("Error: Failed to connect to Redis")
        return
    
    keys = redis.keys(pattern)
    if not keys:
        print(f"No keys found matching pattern: {pattern}")
        return
    
    confirm = input(f"Are you sure you want to delete {len(keys)} keys matching '{pattern}'? (y/n): ")
    if confirm.lower() != 'y':
        print("Operation cancelled")
        return
    
    # Delete keys in batches for better performance with large sets
    batch_size = 1000
    deleted = 0
    
    for i in range(0, len(keys), batch_size):
        batch = keys[i:i+batch_size]
        deleted += redis.delete(*batch)
    
    print(f"Successfully deleted {deleted} keys")

def main():
    """Main function to run the interactive Redis monitor"""
    print("\n===== Redis Cache Monitor =====")
    
    # Check Redis connection first
    redis = get_redis_client()
    if not redis:
        print("\nError: Cannot connect to Redis server!")
        print("Make sure Redis is running at the configured host and port.")
        print("\nIf using Docker, ensure Redis container is running:")
        print("  docker ps | Select-String redis")
        print("\nTo start Redis with Docker:")
        print("  docker run --name my-redis -p 6379:6379 -d redis")
        print("\nConfigure your environment variables in .env file:")
        print("  REDIS_HOST=localhost")
        print("  REDIS_PORT=6379")
        
        # Ask to continue anyway
        choice = input("\nDo you want to continue with the monitor anyway? (y/n): ")
        if choice.lower() != 'y':
            return
    
    print("Type 'help' for available commands")
    
    while True:
        try:
            cmd = input("\nredis-monitor> ").strip()
            
            if not cmd:
                continue
            
            parts = cmd.split()
            command = parts[0].lower()
            args = parts[1:] if len(parts) > 1 else []
            
            if command == "exit":
                break
            elif command == "help":
                display_help()
            elif command == "keys":
                pattern = args[0] if args else "*"
                list_keys(pattern)
            elif command == "get":
                if not args:
                    print("Error: Key required (get <key>)")
                else:
                    get_key_value(args[0])
            elif command == "ttl":
                if not args:
                    print("Error: Key required (ttl <key>)")
                else:
                    redis = get_redis_client()
                    if redis:
                        ttl = redis.ttl(args[0])
                        if ttl == -2:
                            print(f"Key not found: {args[0]}")
                        elif ttl == -1:
                            print(f"Key '{args[0]}' has no expiration")
                        else:
                            print(f"TTL for '{args[0]}': {ttl} seconds")
            elif command == "info":
                show_redis_info()
            elif command == "monitor":
                seconds = int(args[0]) if args and args[0].isdigit() else 10
                monitor_redis(seconds)
            elif command == "clear":
                if not args:
                    print("Error: Pattern required (clear <pattern>)")
                else:
                    clear_keys(args[0])
            else:
                print(f"Unknown command: {command}")
                print("Type 'help' for available commands")
        
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
