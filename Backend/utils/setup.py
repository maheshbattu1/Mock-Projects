# This file initializes the utils module and ensures proper import order
# to prevent circular imports

# Import package modules
from utils import cache_metrics
from utils import cache_decorators
from utils import cache_manager

# Export specific functions for easier imports
from utils.cache_metrics import (
    record_cache_hit,
    record_cache_miss,
    get_cache_stats,
    clear_cache_stats,
    time_function
)

from utils.cache_decorators import (
    redis_cache
)

# Version
__version__ = '1.0.0'
