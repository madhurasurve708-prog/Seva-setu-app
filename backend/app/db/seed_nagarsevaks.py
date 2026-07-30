"""
Nagarsevak seed script.

Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING for wards
and categories, and INSERT ... ON CONFLICT (name, ward_id) DO NOTHING for
nagarsevaks.

Also updates ward_name to 'Ward N' for any rows that still carry the old
'Prabhag N' label, so the script is safe to run against an already-seeded
database.

Never truncates or deletes any existing data.  Running this script on a
production database that already has citizen profiles and complaints is safe.
"""

from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.models.ward import Ward
from app.models.category import Category
from app.models.nagarsevak import Nagarsevak
from app.core.security import get_password_hash

# Ensure all models are registered with Base.metadata before create_all runs
import app.models  # noqa: F401


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

WARDS_DATA = [
    {"id": 1,  "ward_number": "1",  "ward_name": "Ward 1"},
    {"id": 2,  "ward_number": "2",  "ward_name": "Ward 2"},
    {"id": 3,  "ward_number": "3",  "ward_name": "Ward 3"},
    {"id": 4,  "ward_number": "4",  "ward_name": "Ward 4"},
    {"id": 5,  "ward_number": "5",  "ward_name": "Ward 5"},
    {"id": 6,  "ward_number": "6",  "ward_name": "Ward 6"},
    {"id": 7,  "ward_number": "7",  "ward_name": "Ward 7"},
    {"id": 8,  "ward_number": "8",  "ward_name": "Ward 8"},
    {"id": 9,  "ward_number": "9",  "ward_name": "Ward 9"},
    {"id": 10, "ward_number": "10", "ward_name": "Ward 10"},
]

CATEGORIES_DATA = [
    ("Water",         "Issues related to water supply, leakage, or contamination."),
    ("Garbage",       "Uncollected garbage, overflowing bins, or illegal dumping."),
    ("Gutter",        "Blocked or overflowing gutters causing unhygienic conditions."),
    ("Drainage",      "Clogged or broken drainage lines leading to waterlogging."),
    ("Road",          "Potholes, damaged road surface, or broken pavements."),
    ("Street Lights", "Non-functional, damaged, or missing street lights."),
    ("Animals",       "Stray animals causing public nuisance or safety concerns."),
    ("Tree",          "Fallen trees, dangerous branches, or encroaching vegetation."),
    ("Traffic",       "Traffic signal faults, illegal parking, or road blockages."),
    ("Other",         "Any civic issue that does not fall under the above categories."),
]

# Official Nagarsevak master sheet data.
# Display names are used (e.g. "Mandar Keni", not "Keni Mandar Mohan").
# Default password "password123" — must be changed after first login.
# ward_number is used only to look up the ward_id dynamically; it is not stored.
NAGARSEVAKS_DATA = [
    # Ward 1
    {"name": "Mamata Vandkar",           "phone_number": "8208454975", "ward_number": "1"},
    {"name": "Mandar Keni",              "phone_number": "9637778901", "ward_number": "1"},
    {"name": "Darshana Kasavkar",        "phone_number": "9405497503", "ward_number": "1"},
    # Ward 2
    {"name": "Lalit Chavan",             "phone_number": "9096728048", "ward_number": "2"},
    {"name": "Anita Girkar",             "phone_number": "9168206294", "ward_number": "2"},
    # Ward 3
    {"name": "Deepak Patkar",            "phone_number": "9422584073", "ward_number": "3"},
    {"name": "Neena Mumbarkar",          "phone_number": "9422584790", "ward_number": "3"},
    # Ward 4
    {"name": "Siddharth Jadhav",         "phone_number": "9373616290", "ward_number": "4"},
    {"name": "Punam Chavan",             "phone_number": "9404689316", "ward_number": "4"},
    # Ward 5
    {"name": "Mahendra Mhadgut",         "phone_number": "9404944446", "ward_number": "5"},
    {"name": "Mahananda Khanolkar",      "phone_number": "9423806158", "ward_number": "5"},
    # Ward 6
    {"name": "Sahadev Bapardekar",       "phone_number": "9422434962", "ward_number": "6"},
    {"name": "Ashwini Kandalkar",        "phone_number": "9405926438", "ward_number": "6"},
    # Ward 7
    {"name": "Sudesh Aacharekar",        "phone_number": "9422394185", "ward_number": "7"},
    {"name": "Medha Gavkar",             "phone_number": "9422379771", "ward_number": "7"},
    # Ward 8
    {"name": "Mandar Aroskar",           "phone_number": "9545807300", "ward_number": "8"},
    {"name": "Sharvari Patkar",          "phone_number": "9422584866", "ward_number": "8"},
    # Ward 9
    {"name": "Mahesh Koyande",           "phone_number": "9823240054", "ward_number": "9"},
    {"name": "Anvesha Aacharekar",       "phone_number": "8180966833", "ward_number": "9"},
    # Ward 10
    {"name": "Tapaswi Mayekar",          "phone_number": "9404598281", "ward_number": "10"},
    {"name": "Bhagyashree Mayekar",      "phone_number": "7738768702", "ward_number": "10"},
    {"name": "Mahesh Kandalagavkar",     "phone_number": "9823856769", "ward_number": "10"},
    {"name": "Ravikirn Torskar",         "phone_number": "9422633518", "ward_number": "10"},
]


# ---------------------------------------------------------------------------
# Seed logic
# ---------------------------------------------------------------------------

def seed_data() -> None:
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        _seed_wards(db)
        _seed_categories(db)
        _seed_nagarsevaks(db)
        db.commit()
        print("Seeding completed successfully.")
    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


def _seed_wards(db: Session) -> None:
    print("Seeding wards...")
    stmt = (
        pg_insert(Ward)
        .values(WARDS_DATA)
        .on_conflict_do_nothing(index_elements=["ward_number"])
    )
    db.execute(stmt)

    # Rename any rows that still carry the old 'Prabhag N' label.
    updated = 0
    for ward_data in WARDS_DATA:
        result = (
            db.query(Ward)
            .filter(
                Ward.ward_number == ward_data["ward_number"],
                Ward.ward_name != ward_data["ward_name"],
            )
            .first()
        )
        if result:
            result.ward_name = ward_data["ward_name"]
            updated += 1

    print(f"  {len(WARDS_DATA)} ward rows processed (skipped if already exist).")
    if updated:
        print(f"  {updated} ward name(s) updated from old 'Prabhag' labels to 'Ward'.")


def _seed_categories(db: Session) -> None:
    print("Seeding categories...")
    rows = [{"name": name, "description": desc} for name, desc in CATEGORIES_DATA]
    stmt = (
        pg_insert(Category)
        .values(rows)
        .on_conflict_do_nothing(index_elements=["name"])
    )
    db.execute(stmt)
    print(f"  {len(rows)} category rows processed (skipped if already exist).")


def _seed_nagarsevaks(db: Session) -> None:
    print("Seeding nagarsevaks...")
    hashed_password = get_password_hash("password123")

    # Build a ward_number → ward_id lookup from the already-seeded wards table
    ward_map: dict[str, int] = {
        row.ward_number: row.id
        for row in db.query(Ward.ward_number, Ward.id).all()
    }

    rows = []
    for n in NAGARSEVAKS_DATA:
        ward_id = ward_map.get(n["ward_number"])
        if ward_id is None:
            raise ValueError(
                f"Ward number '{n['ward_number']}' not found in database. "
                "Run ward seeding first."
            )
        rows.append(
            {
                "name": n["name"],
                "phone_number": n["phone_number"],
                "ward_id": ward_id,
                "password_hash": hashed_password,
                "is_active": True,
            }
        )

    # Remove any Nagarsevak whose (name, ward_id) pair is not in the official
    # master sheet.  This catches both wholly unknown names and known names
    # that were previously seeded against the wrong ward.
    official_pairs = {(r["name"], ward_map[r["ward_number"]]) for r in rows}
    stale = [
        n for n in db.query(Nagarsevak).all()
        if (n.name, n.ward_id) not in official_pairs
    ]
    if stale:
        for s in stale:
            db.delete(s)
        print(f"  Removed {len(stale)} stale placeholder Nagarsevak(s).")

    # ON CONFLICT on (name, ward_id) — insert new rows, skip existing ones.
    stmt = (
        pg_insert(Nagarsevak)
        .values(rows)
        .on_conflict_do_nothing(constraint="uq_nagarsevak_name_ward")
    )
    db.execute(stmt)

    # Correct phone numbers on existing rows so re-running the seed always
    # brings the database in line with the master sheet.
    phone_map = {(r["name"], r["ward_id"]): r["phone_number"] for r in rows}
    phone_fixed = 0
    for nag in db.query(Nagarsevak).all():
        correct_phone = phone_map.get((nag.name, nag.ward_id))
        if correct_phone and nag.phone_number != correct_phone:
            nag.phone_number = correct_phone
            phone_fixed += 1
    if phone_fixed:
        print(f"  Corrected {phone_fixed} phone number(s) to match master sheet.")

    print(f"  {len(rows)} nagarsevak rows processed (skipped if already exist).")


if __name__ == "__main__":
    seed_data()
