"""
Cache Management Utility

This script provides a command-line interface for managing and monitoring the cache.
It can be used to view cache statistics, clear the cache, or warm the cache.
"""

import argparse
import json
import time
import sys
import os

# Add project root to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.redis_config import get_redis_client
from utils.cache_metrics import get_cache_stats, clear_cache_stats
from fastapi_cache import FastAPICache

def view_cache_stats():
    """View cache statistics"""
    stats = get_cache_stats()
    
    if "error" in stats:
        print(f"Error: {stats['error']}")
        return
    
    global_stats = stats["global"]
    endpoint_stats = stats["endpoints"]
    
    print("\nGlobal Cache Statistics")
    print("-" * 50)
    print(f"Hits: {global_stats['hits']}")
    print(f"Misses: {global_stats['misses']}")
    print(f"Total: {global_stats['total']}")
    print(f"Hit Rate: {global_stats['hit_rate']:.2%}")
    
    if endpoint_stats:
        print("\nEndpoint-specific Statistics")
        print("-" * 50)
        
        # Sort endpoints by hit rate (descending)
        sorted_endpoints = sorted(
            endpoint_stats.items(),
            key=lambda x: x[1]["hit_rate"],
            reverse=True
        )
        
        for endpoint, stats in sorted_endpoints:
            print(f"\n{endpoint}")
            print(f"  Hits: {stats['hits']}")
            print(f"  Misses: {stats['misses']}")
            print(f"  Total: {stats['total']}")
            print(f"  Hit Rate: {stats['hit_rate']:.2%}")
    else:
        print("\nNo endpoint-specific statistics available")
        
def clear_all_caches():
    """Clear all caches in the system"""
    redis = get_redis_client()
    if not redis:
        print("Error: Redis not available")
        return
    
    # Ask for confirmation
    confirm = input("Are you sure you want to clear all caches? This cannot be undone. (y/n): ")
    if confirm.lower() != "y":
        print("Operation cancelled")
        return
    
    # Clear FastAPI cache
    fastapi_keys = redis.keys("fastapi-cache:*")
    if fastapi_keys:
        redis.delete(*fastapi_keys)
        print(f"Cleared {len(fastapi_keys)} FastAPI cache entries")
    else:
        print("No FastAPI cache entries to clear")
    
    # Clear cache statistics
    if clear_cache_stats():
        print("Cleared cache statistics")
    else:
        print("Failed to clear cache statistics")
    
    # Clear any other application-specific caches
    app_keys = redis.keys("app:cache:*")
    if app_keys:
        redis.delete(*app_keys)
        print(f"Cleared {len(app_keys)} application-specific cache entries")
    
    print("All caches cleared successfully")

def export_cache_stats(filename):
    """Export cache statistics to a JSON file"""
    stats = get_cache_stats()
    
    if "error" in stats:
        print(f"Error: {stats['error']}")
        return
    
    # Add timestamp
    stats["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Write to file
    with open(filename, "w") as f:
        json.dump(stats, f, indent=2)
    
    print(f"Cache statistics exported to {filename}")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Cache Management Utility")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # stats command
    stats_parser = subparsers.add_parser("stats", help="View cache statistics")
    
    # clear command
    clear_parser = subparsers.add_parser("clear", help="Clear all caches")
    
    # export command
    export_parser = subparsers.add_parser("export", help="Export cache statistics to a file")
    export_parser.add_argument("filename", help="Filename to export to")
    
    args = parser.parse_args()
    
    if args.command == "stats":
        view_cache_stats()
    elif args.command == "clear":
        clear_all_caches()
    elif args.command == "export":
        export_cache_stats(args.filename)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
