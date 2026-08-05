import os
import sys
from sqlalchemy import create_engine, text

# Add backend app directory to sys.path
sys.path.append(os.path.abspath('.'))

from app.core.config import settings

def main():
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    print(f"Connecting to database...")
    engine = create_engine(database_url)
    
    queries = [
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url VARCHAR(512);",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_department VARCHAR(200);",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_by VARCHAR(150);",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL;",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;"
    ]
    
    with engine.begin() as conn:
        for q in queries:
            print(f"Executing: {q}")
            conn.execute(text(q))
    
    print("Database columns added successfully!")

if __name__ == '__main__':
    main()
