import os
import sys
from sqlalchemy import create_engine, inspect

# Add backend app directory to sys.path
sys.path.append(os.path.abspath('.'))

from app.core.config import settings

def main():
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    print(f"Connecting to database...")
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    # List columns for complaints
    columns = inspector.get_columns('complaints')
    print("Columns in 'complaints' table:")
    for col in columns:
        print(f" - {col['name']}: {col['type']}")

if __name__ == '__main__':
    main()
