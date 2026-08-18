# scripts/reset_official_password.py
import sys
import os

# Adjust path to find the backend app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from sqlalchemy.orm import Session
    from app.db.session import SessionLocal
    from app.models.nagarsevak import Nagarsevak
    from app.core.security import get_password_hash
    from app.db.repository import NagarsevakRepository
except ImportError as e:
    print(f"ImportError: {e}")
    print("Please run this script from the project root directory.")
    sys.exit(1)

def reset_password(name: str, new_pass: str):
    db: Session = SessionLocal()
    try:
        user = db.query(Nagarsevak).filter(Nagarsevak.name == name).first()
        if not user:
            print(f"Error: Nagarsevak '{name}' not found in database.")
            return False
        
        new_hash = get_password_hash(new_pass)
        NagarsevakRepository.update_password_hash(db, user, new_hash)
        db.commit()
        print(f"Success: Password for Nagarsevak '{name}' has been updated securely.")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error: Failed to reset password. {e}")
        return False
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python scripts/reset_official_password.py <Nagarsevak Name> <New Password>")
        print("Example: python scripts/reset_official_password.py \"Ashwini Kandalkar\" \"newsecurepass123\"")
        sys.exit(1)
        
    name_arg = sys.argv[1]
    pass_arg = sys.argv[2]
    reset_password(name_arg, pass_arg)
