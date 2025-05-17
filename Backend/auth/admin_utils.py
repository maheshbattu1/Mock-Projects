"""
This function checks if a user has admin privileges
"""
from models.models import User, UserRole

def check_admin_role(user: User) -> bool:
    """
    Check if user has admin role
    
    Args:
        user: User object
        
    Returns:
        bool: True if user has admin role, False otherwise
    """
    return user.role == UserRole.ADMIN
