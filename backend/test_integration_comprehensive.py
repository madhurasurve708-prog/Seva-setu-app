"""
Comprehensive integration test for Department Officer Backend.
Tests all endpoints including the new announcement system.
"""
import requests

def safe_print(text):
    """Safely print text that might contain unicode characters."""
    try:
        print(text)
    except UnicodeEncodeError:
        print("[Contains unicode characters]")

BASE_URL = "http://localhost:8000"

def test_department_login():
    """Test department login."""
    print("Testing Department Login...")
    
    login_data = {
        "department": "DEPT_PANI",
        "password": "dept@123",
        "name": "Test Water Officer"
    }
    
    response = requests.post(f"{BASE_URL}/api/department/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        try:
            print(f"Login successful. Department: {token_data['department_name']}")
        except UnicodeEncodeError:
            print("Login successful. Department: [Unicode characters]")
        return token_data['access_token']
    else:
        print(f"Login failed: {response.text}")
        return None

def test_get_profile(token):
    """Test get profile endpoint."""
    print("\nTesting Get Profile...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/profile", headers=headers)
    
    print(f"Profile Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        try:
            print(f"Department: {profile['department_name']}")
        except UnicodeEncodeError:
            print("Department: [Unicode characters]")
        print(f"Role: {profile['role']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_dashboard(token):
    """Test dashboard endpoint."""
    print("\nTesting Dashboard...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/complaints/dashboard", headers=headers)
    
    print(f"Dashboard Status: {response.status_code}")
    if response.status_code == 200:
        dashboard = response.json()
        print(f"Total Complaints: {dashboard['total_complaints']}")
        print(f"Pending: {dashboard['pending']}")
        print(f"In Progress: {dashboard['in_progress']}")
        print(f"Resolved: {dashboard['resolved']}")
        print(f"Escalated: {dashboard['escalated']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_complaint_list(token):
    """Test complaint list endpoint."""
    print("\nTesting Complaint List...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/complaints", headers=headers)
    
    print(f"Complaint List Status: {response.status_code}")
    if response.status_code == 200:
        complaints = response.json()
        print(f"Complaints returned: {len(complaints)}")
        if complaints:
            print(f"First complaint ID: {complaints[0]['id']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_complaint_detail(token):
    """Test complaint detail endpoint."""
    print("\nTesting Complaint Detail...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/complaints/1", headers=headers)
    
    print(f"Complaint Detail Status: {response.status_code}")
    if response.status_code == 200:
        detail = response.json()
        print(f"Complaint ID: {detail['id']}")
        print(f"Category: {detail['category']}")
        print(f"Status: {detail['status']}")
        try:
            print(f"Assigned Department: {detail['assigned_department']}")
        except UnicodeEncodeError:
            print("Assigned Department: [Unicode characters]")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_update_status(token):
    """Test status update endpoint."""
    print("\nTesting Status Update...")
    
    headers = {"Authorization": f"Bearer {token}"}
    status_data = {"status": "In Progress"}
    
    response = requests.put(
        f"{BASE_URL}/api/department/complaints/1/status",
        json=status_data,
        headers=headers
    )
    
    print(f"Status Update Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Updated Status: {result['status']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_add_note(token):
    """Test add note endpoint."""
    print("\nTesting Add Note...")
    
    headers = {"Authorization": f"Bearer {token}"}
    note_data = {"note_text": "Integration test note from department officer."}
    
    response = requests.post(
        f"{BASE_URL}/api/department/complaints/1/notes",
        json=note_data,
        headers=headers
    )
    
    print(f"Add Note Status: {response.status_code}")
    if response.status_code == 201:
        note = response.json()
        print(f"Note added by: {note['author_role']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_timeline(token):
    """Test timeline endpoint."""
    print("\nTesting Timeline...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/complaints/1/timeline", headers=headers)
    
    print(f"Timeline Status: {response.status_code}")
    if response.status_code == 200:
        timeline = response.json()
        print(f"Timeline entries: {len(timeline)}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_escalate(token):
    """Test escalation endpoint."""
    print("\nTesting Escalation...")
    
    headers = {"Authorization": f"Bearer {token}"}
    escalation_data = {
        "escalation_target": "Main Admin",
        "escalation_note": "Integration test escalation."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/department/complaints/1/escalate",
        json=escalation_data,
        headers=headers
    )
    
    print(f"Escalation Status: {response.status_code}")
    if response.status_code == 201:
        escalation = response.json()
        print(f"Escalated to: {escalation['escalated_to']}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_announcements(token):
    """Test announcement list endpoint."""
    print("\nTesting Announcements...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/department/announcements", headers=headers)
    
    print(f"Announcements Status: {response.status_code}")
    if response.status_code == 200:
        announcements = response.json()
        print(f"Announcements: {len(announcements)}")
        return True
    else:
        print(f"Failed: {response.text}")
        return False

def test_announcement_detail(token):
    """Test announcement detail endpoint."""
    print("\nTesting Announcement Detail...")
    
    headers = {"Authorization": f"Bearer {token}"}
    # Try to get first announcement if exists
    list_response = requests.get(f"{BASE_URL}/api/department/announcements", headers=headers)
    
    if list_response.status_code == 200 and list_response.json():
        first_id = list_response.json()[0]['id']
        response = requests.get(f"{BASE_URL}/api/department/announcements/{first_id}", headers=headers)
        
        print(f"Announcement Detail Status: {response.status_code}")
        if response.status_code == 200:
            detail = response.json()
            try:
                print(f"Announcement: {detail['title']}")
            except UnicodeEncodeError:
                print("Announcement: [Unicode characters]")
            return True
        else:
            print(f"Failed: {response.text}")
            return False
    else:
        print("No announcements to test detail endpoint")
        return True  # Skip if no announcements

def test_mark_announcement_read(token):
    """Test mark announcement as read endpoint."""
    print("\nTesting Mark Announcement Read...")
    
    headers = {"Authorization": f"Bearer {token}"}
    # Try to mark first announcement as read if exists
    list_response = requests.get(f"{BASE_URL}/api/department/announcements", headers=headers)
    
    if list_response.status_code == 200 and list_response.json():
        first_id = list_response.json()[0]['id']
        response = requests.post(f"{BASE_URL}/api/department/announcements/{first_id}/read", headers=headers)
        
        print(f"Mark Read Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Message: {result['message']}")
            return True
        else:
            print(f"Failed: {response.text}")
            return False
    else:
        print("No announcements to test mark read endpoint")
        return True  # Skip if no announcements

def test_authorization_violations():
    """Test that authorization violations are properly rejected."""
    print("\nTesting Authorization Violations...")
    
    # Test without token
    response = requests.get(f"{BASE_URL}/api/department/complaints/dashboard")
    print(f"No Token Status: {response.status_code} (Expected: 401)")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(f"{BASE_URL}/api/department/complaints/dashboard", headers=headers)
    print(f"Invalid Token Status: {response.status_code} (Expected: 401)")
    
    return response.status_code == 401

def main():
    """Run comprehensive integration tests."""
    print("=" * 60)
    print("Department Officer Integration Test Suite")
    print("=" * 60)
    
    # Test login first
    token = test_department_login()
    
    if not token:
        print("\n[X] Cannot proceed without valid token. Exiting tests.")
        return
    
    results = []
    
    # Test all endpoints
    results.append(("Get Profile", test_get_profile(token)))
    results.append(("Dashboard", test_dashboard(token)))
    results.append(("Complaint List", test_complaint_list(token)))
    results.append(("Complaint Detail", test_complaint_detail(token)))
    results.append(("Update Status", test_update_status(token)))
    results.append(("Add Note", test_add_note(token)))
    results.append(("Timeline", test_timeline(token)))
    results.append(("Escalate", test_escalate(token)))
    results.append(("Announcements", test_announcements(token)))
    results.append(("Announcement Detail", test_announcement_detail(token)))
    results.append(("Mark Announcement Read", test_mark_announcement_read(token)))
    results.append(("Authorization Violations", test_authorization_violations()))
    
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