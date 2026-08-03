from app.db.repository import WardRepository, NagarsevakRepository
from app.db.session import SessionLocal

db = SessionLocal()
try:
    ward = WardRepository.get_by_ward_number(db, '1')
    print(f'Ward: {ward}')
    print(f'Ward ID: {ward.id if ward else None}')
    print(f'Ward Number: {ward.ward_number if ward else None}')
    
    if ward:
        nagarsevak = NagarsevakRepository.get_by_name_and_ward(db, 'Mandar Keni', ward.id)
        print(f'Nagarsevak: {nagarsevak}')
        print(f'Nagarsevak ID: {nagarsevak.id if nagarsevak else None}')
        print(f'Nagarsevak Name: {nagarsevak.name if nagarsevak else None}')
        print(f'Nagarsevak Active: {nagarsevak.is_active if nagarsevak else None}')
        print(f'Nagarsevak Deleted: {nagarsevak.is_deleted if nagarsevak else None}')
finally:
    db.close()
