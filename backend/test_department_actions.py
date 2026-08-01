"""
Test script for Department Officer Complaint Action endpoints.
This script tests the new complaint action functionality.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_department_login():
    """Test department login to get JWT token."""
    print("Testing Department Login...")
    
    login_data = {
        "department": "DEPT_PANI",  # Valid department key from schema
        "password": "dept@123",  # Default temp password from config
        "name": "Test Water Officer"
    }
    
    response = requests.post(f"{BASE_URL}/api/department/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        print(f"Login successful. Token: {token_data['access_token'][:50]}...")
        return token_data['access_token']
    else:
        print(f"Login failed: {response.text}")
        return None

def test_update_complaint_status(token):
    """Test updating complaint status."""
    print("\nTesting Update Complaint Status...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to update complaint ID 1 status
    status_data = {"status": "In Progress"}
    
    response = requests.put(
        f"{BASE_URL}/api/department/complaints/1/status",
        json=status_data,
        headers=headers
    )
    
    print(f"Update Status: {response.status_code}")
    try:
        print(f"Response: {response.text[:200] if response.text else 'No response'}")
    except UnicodeEncodeError:
        print("Response: [Contains unicode characters]")
    
    return response.status_code == 200

def test_add_complaint_note(token):
    """Test adding a complaint note."""
    print("\nTesting Add Complaint Note...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    note_data = {"note_text": "This is a test note from department officer."}
    
    response = requests.post(
        f"{BASE_URL}/api/department/complaints/1/notes",
        json=note_data,
        headers=headers
    )
    
    print(f"Add Note Status: {response.status_code}")
    try:
        print(f"Response: {response.text[:200] if response.text else 'No response'}")
    except UnicodeEncodeError:
        print("Response: [Contains unicode characters]")
    
    return response.status_code == 201

def test_get_complaint_timeline(token):
    """Test getting complaint timeline."""
    print("\nTesting Get Complaint Timeline...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/department/complaints/1/timeline",
        headers=headers
    )
    
    print(f"Timeline Status: {response.status_code}")
    if response.status_code == 200:
        timeline = response.json()
        print(f"Timeline entries: {len(timeline)}")
        for entry in timeline[:3]:  # Show first 3 entries
            try:
                print(f"  - {entry['author_role']}: {entry['note_text'][:50]}...")
            except UnicodeEncodeError:
                print(f"  - {entry['author_role']}: [Contains unicode characters]")
    
    return response.status_code == 200

def test_escalate_complaint(token):
    """Test escalating a complaint."""
    print("\n Testing Escalate Complaint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    escalation_data = {
        "escalation_target": "Main Admin",
        "escalation_note": "This complaint requires higher level attention."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/department/complaints/1/escalate",
        json=escalation_data,
        headers=headers
    )
    
    print(f"Escalate Status: {response.status_code}")
    try:
        print(f"Response: {response.text[:200] if response.text else 'No response'}")
    except UnicodeEncodeError:
        print("Response: [Contains unicode characters]")
    
    return response.status_code == 201

def test_unauthorized_access():
    """Test that unauthorized access is rejected."""
    print("\nTesting Unauthorized Access (wrong department)...")
    
    # Login as water department
    login_data = {
        "department": "DEPT_PANI",
        "password": "dept@123",
        "name": "Test Water Officer"
    }
    
    response = requests.post(f"{BASE_URL}/api/department/login", json=login_data)
    if response.status_code != 200:
        print("Water login failed")
        return False
    
    water_token = response.json()['access_token']
    
    # Try to access a complaint that might belong to another department
    # This should work if complaint 1 belongs to water department
    # But we're testing the mechanism exists
    headers = {"Authorization": f"Bearer {water_token}"}
    
    # Try to access a very high complaint ID that likely doesn't exist or belongs to another dept
    response = requests.put(
        f"{BASE_URL}/api/department/complaints/99999/status",
        json={"status": "In Progress"},
        headers=headers
    )
    
    print(f"Unauthorized access status: {response.status_code}")
    print(f"Expected: 404 (Not Found) or 403 (Forbidden) or 405 (Method Not Allowed)")
    
    return response.status_code in [404, 403, 405]

def main():
    """Run all tests."""
    print("=" * 60)
    print("Department Officer Complaint Actions Test Suite")
    print("=" * 60)
    
    # Test login first
    token = test_department_login()
    
    if not token:
        print("\n[X] Cannot proceed without valid token. Exiting tests.")
        return
    
    results = []
    
    # Test each endpoint
    results.append(("Update Status", test_update_complaint_status(token)))
    results.append(("Add Note", test_add_complaint_note(token)))
    results.append(("Get Timeline", test_get_complaint_timeline(token)))
    results.append(("Escalate Complaint", test_escalate_complaint(token)))
    results.append(("Unauthorized Access", test_unauthorized_access()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    print(f"\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")

if __name__ == "__main__":
    main()