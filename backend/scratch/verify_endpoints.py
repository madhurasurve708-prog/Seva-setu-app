import sys
import os
from dotenv import load_dotenv

# Load env variables from backend/.env first
load_dotenv("backend/.env")

# Add backend directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app.models.ward import Ward
from app.models.category import Category
from app.models.citizen import Citizen
from app.models.complaint import Complaint
from app.models.announcement import Announcement
from app.models.complaint_escalation import ComplaintEscalation
from app.models.announcement_read import AnnouncementRead
from app.models.nagarsevak import Nagarsevak
from app.core.security import get_password_hash


def run_verification():
    print("Step 1: Creating database tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    print("Database tables ensured.")

    db = SessionLocal()
    try:
        print("\nStep 2: Checking/Seeding necessary test records in DB...")
        # 1. Ensure Ward 1 and Category "Water" exist
        ward = db.query(Ward).filter_by(ward_number="1").first()
        if not ward:
            ward = Ward(ward_number="1", ward_name="Ward 1")
            db.add(ward)
            db.commit()
            db.refresh(ward)
        print(f"Ward 1 ID: {ward.id}")

        ward2 = db.query(Ward).filter_by(ward_number="999").first()
        if not ward2:
            ward2 = Ward(ward_number="999", ward_name="Other Ward")
            db.add(ward2)
            db.commit()
            db.refresh(ward2)
        print(f"Ward 2 ID: {ward2.id}")

        category = db.query(Category).filter_by(name="Water").first()
        if not category:
            category = Category(name="Water", description="Water supply issues")
            db.add(category)
            db.commit()
            db.refresh(category)
        print(f"Category 'Water' ID: {category.id}")

        # 2. Ensure Mandar Keni (Nagarsevak) exists
        nagarsevak = db.query(Nagarsevak).filter_by(name="Mandar Keni", ward_id=ward.id).first()
        if not nagarsevak:
            nagarsevak = Nagarsevak(
                name="Mandar Keni",
                phone_number="9422070001",
                ward_id=ward.id,
                password_hash=get_password_hash("password123"),
                is_active=True
            )
            db.add(nagarsevak)
            db.commit()
            db.refresh(nagarsevak)
        print(f"Nagarsevak ID: {nagarsevak.id}")

        # 3. Ensure Citizen exists
        citizen = db.query(Citizen).filter_by(phone_number="9876543210").first()
        if not citizen:
            citizen = Citizen(
                supabase_user_id="test-sb-user-id",
                full_name="Rajesh Patel",
                phone_number="9876543210",
                ward_id=ward.id,
                locality="Near Market"
            )
            db.add(citizen)
            db.commit()
            db.refresh(citizen)
        print(f"Citizen ID: {citizen.id}")

        # 4. Ensure Complaint exists in Mandar's Ward (Ward 1)
        complaint = db.query(Complaint).filter_by(citizen_id=citizen.id, ward_id=ward.id).first()
        if not complaint:
            complaint = Complaint(
                citizen_id=citizen.id,
                ward_id=ward.id,
                category_id=category.id,
                title="Low Water Pressure",
                description="Water pressure is extremely low in mornings.",
                status="Pending",
                priority="Medium"
            )
            db.add(complaint)
            db.commit()
            db.refresh(complaint)
        print(f"Complaint ID: {complaint.id}")

        # 5. Clean up old test announcements & seed 4 new ones
        db.query(AnnouncementRead).delete()
        db.query(Announcement).delete()
        db.commit()

        ann1 = Announcement(
            title="Monsoon Preparedness Review",
            description="All Nagarsevaks are requested to review drainage preparedness.",
            priority="High",
            target_type="all_nagarsevaks",
        )
        ann2 = Announcement(
            title="Ward 1 Cleaning Drive",
            description="Ward 1 cleanliness drive starts Saturday.",
            priority="Medium",
            target_type="ward_nagarsevaks",
            target_ward_id=ward.id,
        )
        ann3 = Announcement(
            title="Public Water Tanker Schedule",
            description="Water tankers will be deployed to all areas.",
            priority="Low",
            target_type="everyone",
        )
        ann4 = Announcement(
            title="Ward 2 Maintenance",
            description="Ward 2 repair works scheduled.",
            priority="Low",
            target_type="ward_nagarsevaks",
            target_ward_id=ward2.id,  # Some other ward ID not visible to Mandar
        )
        db.add_all([ann1, ann2, ann3, ann4])
        db.commit()
        db.refresh(ann1)
        db.refresh(ann2)
        db.refresh(ann3)
        print("Seeded 4 test announcements (3 visible to Mandar, 1 not).")

        print("\nStep 3: Starting API testing with TestClient...")
        client = TestClient(app)

        # 1. Login to get token
        login_res = client.post(
            "/api/nagarsevak/login",
            json={"name": "Mandar Keni", "ward_id": ward.id, "password": "password123"}
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful! Token acquired.")

        # 2. Get Visible Announcements
        ann_res = client.get("/api/nagarsevak/announcements", headers=headers)
        assert ann_res.status_code == 200, f"Get announcements failed: {ann_res.text}"
        announcements_list = ann_res.json()
        print(f"Retrieved {len(announcements_list)} announcements.")
        for a in announcements_list:
            print(f"  - [{a['priority']}] ID {a['id']}: {a['title']} (is_read: {a['is_read']})")

        # Verify 3 announcements are returned (the ones targeted to everyone, all_nagarsevaks, or ward_nagarsevaks of ward 1)
        # Ward 2 maintenance (ward_id=999) should NOT be in the list
        assert len(announcements_list) == 3, f"Expected 3 visible announcements, got {len(announcements_list)}"

        # 3. View Announcement Details
        target_ann_id = ann2.id
        detail_res = client.get(f"/api/nagarsevak/announcements/{target_ann_id}", headers=headers)
        assert detail_res.status_code == 200, f"Get announcement detail failed: {detail_res.text}"
        detail = detail_res.json()
        assert detail["is_read"] is False, "Announcement should be unread initially"
        print(f"Detail check passed. Title: {detail['title']}, is_read: {detail['is_read']}")

        # 4. Mark Announcement as Read
        read_res = client.post(f"/api/nagarsevak/announcements/{target_ann_id}/read", headers=headers)
        assert read_res.status_code == 200, f"Mark read failed: {read_res.text}"
        print("Announcement marked as read.")

        # Re-fetch detail to verify is_read is True
        detail_res = client.get(f"/api/nagarsevak/announcements/{target_ann_id}", headers=headers)
        assert detail_res.json()["is_read"] is True, "Expected announcement to be read"
        print("Re-fetch detail verified is_read is now True.")

        # 5. Escalate Complaint
        escalate_res = client.post(
            f"/api/nagarsevak/complaints/{complaint.id}/escalate",
            headers=headers,
            json={"escalation_target": "Department", "escalation_note": "Immediate help needed. Tanker not sent."}
        )
        assert escalate_res.status_code == 200, f"Escalate complaint failed: {escalate_res.text}"
        esc_data = escalate_res.json()
        print(f"Complaint {complaint.id} escalated. Target: Department, Resolved to: {esc_data['escalated_to']}")
        # Verify it resolved to the department mapped to Water category ("पाणी पुरवठा विभाग")
        assert esc_data["escalated_to"] == "पाणी पुरवठा विभाग", f"Expected resolved department 'पाणी पुरवठा विभाग', got {esc_data['escalated_to']}"

        # 6. Retrieve Timeline and verify the history entry
        timeline_res = client.get(f"/api/complaints/{complaint.id}/timeline", headers=headers)
        assert timeline_res.status_code == 200, f"Timeline fetch failed: {timeline_res.text}"
        timeline = timeline_res.json()
        # Find the escalation note
        escalation_notes = [t for t in timeline if "Escalated to" in t["note_text"]]
        assert len(escalation_notes) > 0, "No escalation note found in timeline"
        print(f"Timeline integration verified. Found note: '{escalation_notes[-1]['note_text']}'")

        # 7. Get Escalated Complaints
        esc_list_res = client.get("/api/nagarsevak/complaints/escalated", headers=headers)
        assert esc_list_res.status_code == 200, f"Get escalated complaints failed: {esc_list_res.text}"
        escalated_list = esc_list_res.json()
        assert len(escalated_list) > 0, "Expected at least 1 escalated complaint in the list"
        print(f"Escalated list retrieved successfully. Count: {len(escalated_list)}")
        print(f"Latest escalation info:")
        print(f"  - Complaint ID: {escalated_list[0]['complaint_id']}")
        print(f"  - Category: {escalated_list[0]['category']}")
        print(f"  - Priority: {escalated_list[0]['priority']}")
        print(f"  - Current Status: {escalated_list[0]['current_status']}")
        print(f"  - Escalated To: {escalated_list[0]['escalated_to']}")
        print(f"  - Escalation Date: {escalated_list[0]['escalation_date']}")
        print(f"  - Note: {escalated_list[0]['latest_escalation_note']}")

        print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉")

    finally:
        db.close()


if __name__ == "__main__":
    run_verification()
