import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from db.database import Base, get_db
from auth.auth_utils import get_password_hash

# Create a test database in memory
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Create test database and tables
@pytest.fixture(scope="function")
def test_db():
    # Create the test database and tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop the test database after the test
        Base.metadata.drop_all(bind=engine)


# Override the get_db dependency
@pytest.fixture(scope="function")
def client(test_db):
    def _get_test_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = _get_test_db
    
    with TestClient(app) as client:
        yield client
    
    # Reset the dependency override
    app.dependency_overrides = {}


# Fixture to create a test user
@pytest.fixture(scope="function")
def test_user(test_db):
    from models.models import User, UserRole
    
    # Create a test user
    test_user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        is_active=True,
        role=UserRole.USER
    )
    
    test_db.add(test_user)
    test_db.commit()
    test_db.refresh(test_user)
    
    return test_user
