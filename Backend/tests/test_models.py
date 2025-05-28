import pytest
from models.models import User, UserRole
from sqlalchemy.exc import IntegrityError

def test_user_model_creation(test_db):
    """Test that a user can be created successfully"""
    # Create a new user
    user = User(
        name="John Doe",
        email="john@example.com",
        hashed_password="hashedpassword",
        phone="+1234567890",
        age=30,
        address="123 Main St",
        is_active=True,
        role=UserRole.USER
    )
    
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    # Verify the user was created
    assert user.id is not None
    assert user.name == "John Doe"
    assert user.email == "john@example.com"
    assert user.role == UserRole.USER

def test_user_unique_email_constraint(test_db):
    """Test that users must have unique emails"""
    # Create first user
    user1 = User(
        name="John Doe",
        email="same@example.com",
        hashed_password="hashedpassword",
        is_active=True,
        role=UserRole.USER
    )
    
    test_db.add(user1)
    test_db.commit()
    
    # Try to create second user with same email
    user2 = User(
        name="Jane Doe",
        email="same@example.com",
        hashed_password="hashedpassword",
        is_active=True,
        role=UserRole.USER
    )
    
    test_db.add(user2)
    
    # Should raise an integrity error due to unique constraint
    with pytest.raises(IntegrityError):
        test_db.commit()
