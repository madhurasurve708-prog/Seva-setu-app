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
    
    for table_name in inspector.get_table_names():
        print(f"\nTable: {table_name}")
        for col in inspector.get_columns(table_name):
            print(f" - {col['name']}: {col['type']}")

if __name__ == '__main__':
    main()
