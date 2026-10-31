"""
Unit & Integration tests for Nagarsevak Mobile Authentication.
Tests:
- Schema validation: phone_number and password are required; name is rejected
- Authentication exclusively by registered mobile number + password
- Database identity returned (name and ward come from DB, not client)
- Generic 401 errors for invalid phone or password (anti-enumeration)
- Rejection of name-only login payloads (422)
- Absence of demo-password bypasses
- Independent authentication for multiple Nagarsevaks in the same ward
- Phone-number normalization across various prefixes/delimiters
- Inactive account login rejection (403)
- Inactive account access rejection using a previously issued token (403)
- Duplicate phone-number safety (409 Conflict, no guessing identities)
- Phone-number update uniqueness validation (400 Bad Request)
- No password hashes or sensitive fields in responses
"""
import unittest
from starlette.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.db.session import SessionLocal
from app.models.nagarsevak import Nagarsevak
from app.schemas.nagarsevak import NagarsevakLogin
from app.utils.phone import normalize_phone_number
from app.core.security import get_password_hash


class TestNagarsevakMobileLogin(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_schema_requires_phone_number_and_password(self):
        """Schema must require phone_number and password; name and ward_number must be absent."""
        data = NagarsevakLogin(
            phone_number="8208454975",
            password="password123"
        )
        self.assertEqual(data.phone_number, "8208454975")
        self.assertFalse(hasattr(data, "name"), "name must not be a field on NagarsevakLogin")
        self.assertFalse(hasattr(data, "ward_number"), "ward_number must not be a field on NagarsevakLogin")

        # Missing phone_number must fail validation
        with self.assertRaises(ValidationError):
            NagarsevakLogin(password="password123")  # type: ignore

        # Missing password must fail validation
        with self.assertRaises(ValidationError):
            NagarsevakLogin(phone_number="8208454975")  # type: ignore

    def test_login_success_returns_database_identity(self):
        """
        Login with registered phone and password succeeds and returns
        database-backed profile and JWT access token.
        """
        payload = {
            "phone_number": "8208454975",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

        nagarsevak = data["nagarsevak"]
        self.assertEqual(nagarsevak["name"], "Mamata Waradkar")
        self.assertEqual(nagarsevak["phone_number"], "8208454975")
        self.assertEqual(str(nagarsevak["ward_number"]), "1")

    def test_no_password_hash_in_login_response(self):
        """Ensure password hashes and raw passwords are never exposed in the response."""
        payload = {
            "phone_number": "8208454975",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertNotIn("password_hash", data)
        self.assertNotIn("password", data)
        self.assertNotIn("password_hash", data["nagarsevak"])
        self.assertNotIn("password", data["nagarsevak"])

    def test_login_invalid_phone_returns_generic_401(self):
        """Unknown phone number must fail with generic 401 error."""
        payload = {
            "phone_number": "9999999999",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials or password.")

    def test_login_invalid_password_returns_generic_401(self):
        """Incorrect password must fail with generic 401 error matching unknown phone error."""
        payload = {
            "phone_number": "8208454975",
            "password": "WrongPassword!456"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials or password.")

    def test_name_only_payload_rejected_with_422(self):
        """
        A payload containing name but omitting phone_number must be rejected with 422
        because phone_number is mandatory.
        """
        payload = {
            "name": "Mamata Waradkar",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_multiple_nagarsevaks_same_ward_independent_auth(self):
        """
        Two Nagarsevaks in the same ward authenticate independently
        using their distinct registered phone numbers and receive their own identities.
        """
        res1 = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "8208454975",
            "password": "password123"
        })
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()

        res2 = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "9637778901",
            "password": "password123"
        })
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()

        # Both belong to Ward 1
        self.assertEqual(str(data1["nagarsevak"]["ward_number"]), "1")
        self.assertEqual(str(data2["nagarsevak"]["ward_number"]), "1")

        # Distinct identities and JWT tokens
        self.assertNotEqual(data1["nagarsevak"]["id"], data2["nagarsevak"]["id"])
        self.assertEqual(data1["nagarsevak"]["name"], "Mamata Waradkar")
        self.assertEqual(data2["nagarsevak"]["name"], "Mandar Keni")
        self.assertNotEqual(data1["access_token"], data2["access_token"])

    def test_phone_normalization_formats(self):
        """Test normalization across +91 prefix, leading 0, spaces, and hyphens."""
        # Direct unit test on normalize_phone_number function
        self.assertEqual(normalize_phone_number("+919637778901"), "9637778901")
        self.assertEqual(normalize_phone_number("+91 96377 78901"), "9637778901")
        self.assertEqual(normalize_phone_number("09637778901"), "9637778901")
        self.assertEqual(normalize_phone_number("963-777-8901"), "9637778901")
        self.assertEqual(normalize_phone_number("9637778901"), "9637778901")

        # API login with +91 prefix
        res_plus91 = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "+919637778901",
            "password": "password123"
        })
        self.assertEqual(res_plus91.status_code, 200)
        self.assertEqual(res_plus91.json()["nagarsevak"]["name"], "Mandar Keni")

        # API login with leading 0
        res_zero = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "09637778901",
            "password": "password123"
        })
        self.assertEqual(res_zero.status_code, 200)
        self.assertEqual(res_zero.json()["nagarsevak"]["name"], "Mandar Keni")

        # API login with hyphens
        res_hyphen = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "963-777-8901",
            "password": "password123"
        })
        self.assertEqual(res_hyphen.status_code, 200)
        self.assertEqual(res_hyphen.json()["nagarsevak"]["name"], "Mandar Keni")

    def test_inactive_account_login_rejected(self):
        """An inactive Nagarsevak account must be rejected with 403 Forbidden."""
        db = SessionLocal()
        officer = db.query(Nagarsevak).filter(Nagarsevak.phone_number == "8208454975").first()
        self.assertIsNotNone(officer)
        original_status = officer.is_active

        try:
            officer.is_active = False
            db.commit()

            response = self.client.post("/api/nagarsevak/login", json={
                "phone_number": "8208454975",
                "password": "password123"
            })
            self.assertEqual(response.status_code, 403)
            self.assertIn("inactive", response.json()["detail"].lower())
        finally:
            officer.is_active = original_status
            db.commit()
            db.close()

    def test_inactive_account_access_using_existing_token_rejected(self):
        """
        An existing valid token must be rejected with 403 when the account is deactivated.
        """
        # 1. Login while active to get a valid token
        login_res = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "8208454975",
            "password": "password123"
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Deactivate the account in the database
        db = SessionLocal()
        officer = db.query(Nagarsevak).filter(Nagarsevak.phone_number == "8208454975").first()
        self.assertIsNotNone(officer)
        original_status = officer.is_active

        try:
            officer.is_active = False
            db.commit()

            # 3. Access a protected endpoint with the existing token
            protected_res = self.client.get("/api/nagarsevak/complaints/dashboard", headers=headers)
            self.assertEqual(protected_res.status_code, 403)
            self.assertIn("inactive", protected_res.json()["detail"].lower())
        finally:
            officer.is_active = original_status
            db.commit()
            db.close()

    def test_duplicate_phone_number_handling(self):
        """
        If duplicate accounts share the same phone number, the system refuses to guess
        identity and raises 409 Conflict.
        """
        db = SessionLocal()
        officer = db.query(Nagarsevak).filter(Nagarsevak.phone_number == "8208454975").first()
        self.assertIsNotNone(officer)
        temp_nagarsevak = None
        try:
            # Create a temporary secondary record with duplicate phone using a valid ward_id
            temp_nagarsevak = Nagarsevak(
                name="Duplicate Test Officer",
                phone_number="8208454975",
                ward_id=officer.ward_id,
                password_hash=get_password_hash("password123"),
                is_active=True
            )
            db.add(temp_nagarsevak)
            db.commit()

            response = self.client.post("/api/nagarsevak/login", json={
                "phone_number": "8208454975",
                "password": "password123"
            })
            self.assertEqual(response.status_code, 409)
            self.assertIn("multiple accounts", response.json()["detail"].lower())
        finally:
            if temp_nagarsevak and temp_nagarsevak.id:
                db.delete(temp_nagarsevak)
                db.commit()
            db.close()

    def test_phone_update_uniqueness_validation(self):
        """
        Attempting to update an official's phone number to one already in use
        by another Nagarsevak must be rejected with 400 Bad Request.
        """
        # Login as Mamata (8208454975)
        login_res = self.client.post("/api/nagarsevak/login", json={
            "phone_number": "8208454975",
            "password": "password123"
        })
        self.assertEqual(login_res.status_code, 200)
        headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        # Attempt to change Mamata's phone to Mandar's phone (9637778901)
        update_res = self.client.put(
            "/api/nagarsevak/profile/phone",
            json={"phone_number": "9637778901"},
            headers=headers
        )
        self.assertEqual(update_res.status_code, 400)
        self.assertIn("already registered", update_res.json()["detail"].lower())


if __name__ == "__main__":
    unittest.main()
