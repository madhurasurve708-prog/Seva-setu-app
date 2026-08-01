"""
Main Admin seed script.

Creates the 3 Main Admin accounts for the Seva Setu system:
- Nagaradhyaksha (Mamta Waradkar)
- Upnagaradhyaksha (Dipak Patkar)
- CEO

Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING.
Default password: admin@123 (must be changed after first login).

Never truncates or deletes any existing data.
"""

from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.models.main_admin import MainAdmin
from app.core.security import get_password_hash

# Ensure all models are registered with Base.metadata before create_all runs
import app.models  # noqa: F401


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

MAIN_ADMINS_DATA = [
    {
        "name": "Mamta Waradkar",
        "role": "nagaradhyaksha",
    },
    {
        "name": "Dipak Patkar",
        "role": "upnagaradhyaksha",
    },
    {
        "name": "CEO",
        "role": "ceo",
    },
]


# ---------------------------------------------------------------------------
# Seed logic
# ---------------------------------------------------------------------------

def seed_data() -> None:
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        _seed_main_admins(db)
        db.commit()
        print("Main Admin seeding completed successfully.")
    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


def _seed_main_admins(db: Session) -> None:
    print("Seeding Main Admin accounts...")
    hashed_password = get_password_hash("admin@123")

    rows = []
    for admin_data in MAIN_ADMINS_DATA:
        rows.append(
            {
                "name": admin_data["name"],
                "role": admin_data["role"],
                "password_hash": hashed_password,
                "is_active": True,
            }
        )

    # Use ON CONFLICT DO NOTHING to avoid duplicate inserts based on name
    # This ensures idempotency - running multiple times won't create duplicates
    stmt = (
        pg_insert(MainAdmin)
        .values(rows)
        .on_conflict_do_nothing(index_elements=["name"])
    )
    result = db.execute(stmt)
    
    created_count = result.rowcount
    if created_count > 0:
        print(f"  {created_count} Main Admin account(s) created.")
    else:
        print("  Main Admin accounts already exist (skipping creation).")
    
    print("  Default password: admin@123 (CHANGE AFTER FIRST LOGIN)")
    print("  Accounts:")
    for admin in MAIN_ADMINS_DATA:
        print(f"    - {admin['role']}: {admin['name']}")


if __name__ == "__main__":
    seed_data()
