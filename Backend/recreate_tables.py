from db.database import engine
from models.models import Base
import traceback

def recreate_tables():
    """Drop all tables and recreate them based on the current models"""
    try:
        # Drop all tables
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped successfully.")
        
        # Recreate all tables
        print("Creating tables according to models...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
        
        return True
    except Exception as e:
        print(f"Error recreating database tables: {e}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Run the function to recreate tables
    success = recreate_tables()
    if success:
        print("Database schema has been successfully updated with all current models.")
    else:
        print("Failed to update database schema. Check the error messages above.")