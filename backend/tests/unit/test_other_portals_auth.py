"""
Test to verify preservation of citizen, Main Admin, and Department Officer auth flows.
"""
import unittest
from starlette.testclient import TestClient
from app.main import app

class TestOtherPortalsAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_department_login_preserved(self):
        """Test department login endpoint is functional."""
        res = self.client.post("/api/department/login", json={
            "department": "DEPT_PANI",
            "password": "dept@123",
            "name": "Test Officer"
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.json())

    def test_main_admin_login_endpoint_exists(self):
        """Test main admin login endpoint exists."""
        res = self.client.post("/api/main-admin/login", json={
            "name": "NonExistentAdmin",
            "password": "wrongpassword"
        })
        # Should return 401 Unauthorized, not 404/500
        self.assertEqual(res.status_code, 401)

    def test_citizen_auth_endpoint_preserved(self):
        """Test citizen profile endpoint requires auth."""
        res = self.client.post("/api/citizen/profile", json={
            "full_name": "Test Citizen",
            "phone_number": "9876543210",
            "ward_id": 1,
            "locality": "Test Locality"
        })
        # Without Bearer token, must return 401/403
        self.assertIn(res.status_code, [401, 403])

if __name__ == "__main__":
    unittest.main()
