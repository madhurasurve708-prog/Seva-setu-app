"""
Unit & Integration tests for Nagarsevak Mobile Authentication (Step 2).
Tests:
- Schema validation
- Authentication exclusively by registered mobile number + password
- Form name decoupling (name from DB returned, client name ignored)
- Generic 401 errors for invalid phone or password
- Independent authentication for multiple Nagarsevaks in the same ward
- No password hashes or sensitive authentication data in responses
"""
import unittest
from starlette.testclient import TestClient
from app.main import app
from app.schemas.nagarsevak import NagarsevakLogin
from pydantic import ValidationError


class TestNagarsevakMobileLogin(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_schema_requires_fields(self):
        """Test that schema requires name, phone_number, and password."""
        # Valid schema
        data = NagarsevakLogin(
            name="Any Officer Name",
            phone_number="8208454975",
            password="password123"
        )
        self.assertEqual(data.phone_number, "8208454975")
        self.assertEqual(data.name, "Any Officer Name")

        # Missing phone_number should fail validation
        with self.assertRaises(ValidationError):
            NagarsevakLogin(name="Test", password="password123")  # type: ignore

        # Missing password should fail validation
        with self.assertRaises(ValidationError):
            NagarsevakLogin(name="Test", phone_number="8208454975")  # type: ignore

    def test_login_success_with_arbitrary_client_name(self):
        """
        Verify login succeeds with correct registered phone and password,
        regardless of what name is supplied by the client, and returns the
        actual database identity.
        """
        payload = {
            "name": "Completely Different Name Passed By Client",
            "phone_number": "8208454975",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

        nagarsevak = data["nagarsevak"]
        # Name and ward must come from the database record, NOT client payload
        self.assertEqual(nagarsevak["name"], "Mamata Waradkar")
        self.assertEqual(nagarsevak["phone_number"], "8208454975")
        self.assertEqual(str(nagarsevak["ward_number"]), "1")
        # Ensure password hash is never exposed
        self.assertNotIn("password_hash", nagarsevak)
        self.assertNotIn("password", nagarsevak)

    def test_login_invalid_phone_returns_generic_401(self):
        """Invalid phone number must fail with generic 401 error."""
        payload = {
            "name": "Mamata Waradkar",
            "phone_number": "9999999999",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid mobile number or password.")

    def test_login_invalid_password_returns_generic_401(self):
        """Incorrect password must fail with generic 401 error."""
        payload = {
            "name": "Mamata Waradkar",
            "phone_number": "8208454975",
            "password": "WrongPassword!456"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid mobile number or password.")

    def test_multiple_nagarsevaks_same_ward_independent_auth(self):
        """
        Verify two Nagarsevaks in the same ward authenticate independently
        using their own registered phone numbers and receive their own identities.
        """
        # Account 1: Mamata Waradkar (Ward 1)
        res1 = self.client.post("/api/nagarsevak/login", json={
            "name": "Mamata",
            "phone_number": "8208454975",
            "password": "password123"
        })
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()

        # Account 2: Mandar Keni (Ward 1)
        res2 = self.client.post("/api/nagarsevak/login", json={
            "name": "Mandar",
            "phone_number": "9637778901",
            "password": "password123"
        })
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()

        # Both belong to Ward 1
        self.assertEqual(str(data1["nagarsevak"]["ward_number"]), "1")
        self.assertEqual(str(data2["nagarsevak"]["ward_number"]), "1")

        # But they have distinct identities and tokens
        self.assertNotEqual(data1["nagarsevak"]["id"], data2["nagarsevak"]["id"])
        self.assertEqual(data1["nagarsevak"]["name"], "Mamata Waradkar")
        self.assertEqual(data2["nagarsevak"]["name"], "Mandar Keni")
        self.assertNotEqual(data1["access_token"], data2["access_token"])

    def test_phone_normalization_with_prefix(self):
        """Verify phone number with +91 prefix normalizes and authenticates."""
        payload = {
            "name": "Mandar Keni",
            "phone_number": "+919637778901",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["nagarsevak"]["name"], "Mandar Keni")


    def test_missing_phone_returns_422(self):
        """Missing phone_number must return 422 with validation detail."""
        payload = {
            "name": "Mamata Waradkar",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertIn("detail", data)
        self.assertTrue(any("phone_number" in loc for err in data["detail"] for loc in err.get("loc", [])))

    def test_short_phone_returns_422(self):
        """Phone number with fewer than 10 digits must return 422."""
        payload = {
            "name": "Mamata Waradkar",
            "phone_number": "123",
            "password": "password123"
        }
        response = self.client.post("/api/nagarsevak/login", json=payload)
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertIn("detail", data)
        self.assertTrue(any("phone_number" in loc for err in data["detail"] for loc in err.get("loc", [])))


if __name__ == "__main__":
    unittest.main()

