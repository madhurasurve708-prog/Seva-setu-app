"""
Regression test for the official password change flow.
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

def run_tests():
    print("=" * 60)
    print("Running Official Password Change Flow Regression Tests...")
    print("=" * 60)

    # 1. Attempt login with old password
    print("\n1. Testing login with initial seeded password...")
    login_data = {
        "name": "Mamata Waradkar",
        "ward_number": 1,
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/api/nagarsevak/login", json=login_data)
    if response.status_code != 200:
        print(f"FAILED: Initial login failed with status {response.status_code}")
        print(response.text)
        return False
    print("SUCCESS: Initial login succeeded.")
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Try to change password with a wrong current password
    print("\n2. Testing password change with WRONG current password...")
    change_data_wrong = {
        "current_password": "wrongpassword",
        "new_password": "newpassword123"
    }
    response = requests.put(
        f"{BASE_URL}/api/nagarsevak/profile/password",
        json=change_data_wrong,
        headers=headers
    )
    if response.status_code != 400:
        print(f"FAILED: Expected status 400, got {response.status_code}")
        print(response.text)
        return False
    print("SUCCESS: Password change rejected with 400 Bad Request.")

    # 3. Verify that the initial password still works (credentials were not cleared or changed)
    print("\n3. Verifying that the initial password still works after failed attempt...")
    response = requests.post(f"{BASE_URL}/api/nagarsevak/login", json=login_data)
    if response.status_code != 200:
        print(f"FAILED: Initial password failed to log in after rejected change attempt.")
        return False
    print("SUCCESS: Initial password still works.")

    # 4. Change password with correct current password
    print("\n4. Testing password change with CORRECT current password...")
    change_data_correct = {
        "current_password": "password123",
        "new_password": "newpassword123"
    }
    response = requests.put(
        f"{BASE_URL}/api/nagarsevak/profile/password",
        json=change_data_correct,
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: Password change failed with status {response.status_code}")
        print(response.text)
        return False
    print("SUCCESS: Password changed successfully.")

    # 5. Verify that the OLD password is now rejected
    print("\n5. Testing login with the OLD password (should fail)...")
    response = requests.post(f"{BASE_URL}/api/nagarsevak/login", json=login_data)
    if response.status_code != 401:
        print(f"FAILED: Old password was not rejected, got status {response.status_code}")
        return False
    print("SUCCESS: Old password rejected successfully.")

    # 6. Verify that the NEW password works
    print("\n6. Testing login with the NEW password...")
    login_data_new = {
        "name": "Mamata Waradkar",
        "ward_number": 1,
        "password": "newpassword123"
    }
    response = requests.post(f"{BASE_URL}/api/nagarsevak/login", json=login_data_new)
    if response.status_code != 200:
        print(f"FAILED: Login with new password failed with status {response.status_code}")
        print(response.text)
        return False
    print("SUCCESS: Login with new password succeeded.")
    new_token = response.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # 7. Clean-up: restore the original password
    print("\n7. Cleaning up: restoring initial seeded password...")
    change_data_restore = {
        "current_password": "newpassword123",
        "new_password": "password123"
    }
    response = requests.put(
        f"{BASE_URL}/api/nagarsevak/profile/password",
        json=change_data_restore,
        headers=new_headers
    )
    if response.status_code != 200:
        print(f"FAILED: Clean-up password restore failed with status {response.status_code}")
        print(response.text)
        return False
    print("SUCCESS: Original seeded password restored successfully.")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
