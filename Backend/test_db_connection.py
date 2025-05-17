from db.database import engine, DATABASE_URL
import sqlalchemy

def test_database_connection():
    """Test the connection to the PostgreSQL database"""
    print(f"Attempting to connect to database with URL: {DATABASE_URL}")
    
    try:
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(sqlalchemy.text("SELECT 1"))
            print(f"Connection successful! Database responded with: {result.scalar()}")
            return True
    except Exception as e:
        print(f"Connection failed with error: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()