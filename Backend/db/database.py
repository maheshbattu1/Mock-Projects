from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import re
from psycopg2 import connect
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Extract database name from the URL
db_name_match = re.search(r"/([^/]+)$", DATABASE_URL)
DB_NAME = db_name_match.group(1) if db_name_match else "Dwelzo"

# Create a base URL without the database name for initial connection
BASE_URL = DATABASE_URL.rsplit('/', 1)[0]

def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (without specifying a database)
        with connect(f"{BASE_URL}/postgres") as connection:
            connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            with connection.cursor() as cursor:
                # Check if database exists
                cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
                exists = cursor.fetchone()
                
                if not exists:
                    print(f"Creating database {DB_NAME}...")
                    cursor.execute(f"CREATE DATABASE {DB_NAME}")
                    print(f"Database {DB_NAME} created successfully.")
                else:
                    print(f"Database {DB_NAME} already exists.")
        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

try:
    # Attempt to create the database if it doesn't exist
    create_database_if_not_exists()
    
    # Now connect to the specified database
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print(f"Connected to database {DB_NAME} successfully.")
except Exception as e:
    print(f"Database connection error: {e}")
    # Fallback to SQLite if PostgreSQL connection fails
    print("Falling back to SQLite database...")
    SQLITE_DATABASE_URL = "sqlite:///./app.db"
    engine = create_engine(SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()