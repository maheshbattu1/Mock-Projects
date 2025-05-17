import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import re
import os
from dotenv import load_dotenv

def init_database():
    """Initialize the database if it doesn't exist yet"""
    load_dotenv()
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Extract database name and connection details from URL
    db_name_match = re.search(r"/([^/]+)$", DATABASE_URL)
    if not db_name_match:
        print("Invalid DATABASE_URL format")
        return False
        
    DB_NAME = db_name_match.group(1)
    
    # Create a base URL without the database name
    BASE_URL = DATABASE_URL.rsplit('/', 1)[0]
    
    print(f"Connecting to PostgreSQL server...")
    try:
        # Connect to default PostgreSQL database
        conn = psycopg2.connect(f"{BASE_URL}/postgres")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_NAME,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database {DB_NAME}...")
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Database {DB_NAME} created successfully.")
        else:
            print(f"Database {DB_NAME} already exists.")
            
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    init_database()