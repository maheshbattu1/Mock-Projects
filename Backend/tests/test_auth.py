import pytest
from fastapi import HTTPException
from auth.auth_utils import verify_password, authenticate_user, get_password_hash

def test_password_hashing():
    """Test that password hashing and verification works"""
    password = "mysecretpassword"
    hashed = get_password_hash(password)
    
    # Make sure the hash is different from the original password
    assert hashed != password
    
    # Verify that the password can be verified against the hash
    assert verify_password(password, hashed) is True
    
    # Verify that wrong passwords don't verify
    assert verify_password("wrongpassword", hashed) is False

def test_authenticate_user(test_db, test_user):
    """Test that user authentication works properly"""
    # Successfully authenticate with correct credentials
    authenticated_user = authenticate_user(
        test_db, 
        email="test@example.com", 
        password="testpassword"
    )
    assert authenticated_user is not None
    assert authenticated_user.email == "test@example.com"
    
    # Fail authentication with incorrect password
    bad_auth_user = authenticate_user(
        test_db, 
        email="test@example.com", 
        password="wrongpassword"
    )
    assert bad_auth_user is None
    
    # Fail authentication with non-existent email
    nonexistent_user = authenticate_user(
        test_db, 
        email="nonexistent@example.com", 
        password="testpassword"
    )
    assert nonexistent_user is None
