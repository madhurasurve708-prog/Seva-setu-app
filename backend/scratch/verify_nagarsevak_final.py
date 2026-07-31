"""Isolated API regression check for the Nagarsevak final-polish pass."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.db.base_class import Base
from app.dependencies.db import get_db
from app.main import app
from app.models import Announcement, Category, Citizen, Complaint, Nagarsevak, Ward


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def override_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


def seed() -> None:
    Base.metadata.create_all(engine)
    db = TestSession()
    try:
        ward_one = Ward(ward_number="1", ward_name="Ward 1")
        ward_two = Ward(ward_number="2", ward_name="Ward 2")
        category = Category(name="Water", description="Water supply")
        db.add_all([ward_one, ward_two, category])
        db.flush()

        citizen_one = Citizen(
            supabase_user_id="citizen-one", full_name="Citizen One",
            phone_number="9000000001", ward_id=ward_one.id, locality="Area One",
        )
        citizen_two = Citizen(
            supabase_user_id="citizen-two", full_name="Citizen Two",
            phone_number="9000000002", ward_id=ward_two.id, locality="Area Two",
        )
        nagarsevak = Nagarsevak(
            name="Ward One Representative", phone_number="9111111111", ward_id=ward_one.id,
            password_hash=get_password_hash("correct-password"), is_active=True,
        )
        db.add_all([citizen_one, citizen_two, nagarsevak])
        db.flush()

        own = Complaint(
            citizen_id=citizen_one.id, ward_id=ward_one.id, category_id=category.id,
            title="Own", description="Clean water issue", status="Pending", priority="Medium",
        )
        other = Complaint(
            citizen_id=citizen_two.id, ward_id=ward_two.id, category_id=category.id,
            title="Other", description="Clean water issue", status="Pending", priority="Medium",
        )
        visible = Announcement(
            title="Everyone", description="Visible", priority="Low", target_type="everyone",
        )
        hidden = Announcement(
            title="Other ward", description="Hidden", priority="Low",
            target_type="ward_nagarsevaks", target_ward_id=ward_two.id,
        )
        db.add_all([own, other, visible, hidden])
        db.commit()
        return own.id, other.id, visible.id, hidden.id, ward_one.id
    finally:
        db.close()


def main() -> None:
    own_id, other_id, announcement_id, hidden_id, ward_id = seed()
    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)

    assert client.get("/api/nagarsevak/profile").status_code in {401, 403}
    login = client.post(
        "/api/nagarsevak/login",
        json={"name": "Ward One Representative", "ward_id": ward_id, "password": "correct-password"},
    )
    assert login.status_code == 200, login.text
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert client.get("/api/nagarsevak/profile", headers=headers).status_code == 200

    complaints = client.get("/api/nagarsevak/complaints", headers=headers)
    assert complaints.status_code == 200 and [row["id"] for row in complaints.json()] == [own_id]
    assert client.get(f"/api/nagarsevak/complaints/{other_id}", headers=headers).status_code == 404
    assert client.put(
        f"/api/nagarsevak/complaints/{own_id}/status",
        headers=headers, json={"status": "Invalid"},
    ).status_code == 422
    assert client.post(
        f"/api/nagarsevak/complaints/{own_id}/notes",
        headers=headers, data={"note_text": "   "},
    ).status_code == 422
    assert client.post(
        f"/api/nagarsevak/complaints/{own_id}/notes",
        headers=headers, data={"note_text": "This is shit"},
    ).status_code == 422
    assert client.post(
        f"/api/nagarsevak/complaints/{own_id}/escalate",
        headers=headers, json={"escalation_target": "Invalid", "escalation_note": "Need help"},
    ).status_code == 422
    assert client.get(f"/api/nagarsevak/announcements/{hidden_id}", headers=headers).status_code == 404
    assert client.post(
        f"/api/nagarsevak/announcements/{announcement_id}/read", headers=headers
    ).status_code == 200
    assert client.get(
        f"/api/nagarsevak/announcements/{announcement_id}", headers=headers
    ).json()["is_read"] is True
    assert client.get("/api/citizen/profile/citizen-one").status_code == 200
    print("Nagarsevak final API regression checks: PASS")


if __name__ == "__main__":
    main()
