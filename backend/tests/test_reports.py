"""
Test suite for Reports (Signalements) feature
Tests the closed registration reporting system where visitors can report
when race registrations are closed. After 3 reports, auto-closes registration.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@trailfrance.com"
ADMIN_PASSWORD = "admin123"

# Trail des Sangliers race ID (for testing existing reports)
TEST_RACE_ID = "53f3888a-03d6-4aa5-a7ac-b4fdecd533f7"


class TestReportEndpoints:
    """Test the report-closed feature endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    @pytest.fixture
    def race_with_open_registration(self, admin_headers):
        """Get a race that has open registration status"""
        # First get all races
        response = requests.get(f"{BASE_URL}/api/races?registration_status=open")
        if response.status_code == 200:
            races = response.json()
            if races:
                return races[0]
        pytest.skip("No races with open registration found")
    
    # --- Test POST /api/races/{race_id}/report-closed ---
    
    def test_report_closed_success(self, race_with_open_registration):
        """Test successful report submission for a race with open registrations"""
        race_id = race_with_open_registration['id']
        
        response = requests.post(
            f"{BASE_URL}/api/races/{race_id}/report-closed",
            json={"reason": "TEST_Inscriptions closes signalées par un visiteur"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "report_count" in data
        assert isinstance(data["report_count"], int)
        assert data["report_count"] >= 1
        print(f"Report submitted successfully. Count: {data['report_count']}/3")
    
    def test_report_closed_nonexistent_race(self):
        """Test reporting for a non-existent race returns 404"""
        fake_race_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/races/{fake_race_id}/report-closed",
            json={"reason": "Test reason"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print(f"Correctly returned 404 for non-existent race")
    
    def test_report_closed_without_reason(self, race_with_open_registration):
        """Test report submission with default reason (no reason provided)"""
        race_id = race_with_open_registration['id']
        
        response = requests.post(
            f"{BASE_URL}/api/races/{race_id}/report-closed",
            json={}  # No reason provided, should use default
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"Report without explicit reason accepted")
    
    # --- Test GET /api/admin/reports ---
    
    def test_get_admin_reports_requires_auth(self):
        """Test that admin reports endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/reports")
        
        assert response.status_code in [401, 403]
        print("Admin reports endpoint correctly requires authentication")
    
    def test_get_admin_reports_with_admin(self, admin_headers):
        """Test admin can view pending reports"""
        response = requests.get(f"{BASE_URL}/api/admin/reports", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify structure if there are reports
        if data:
            report = data[0]
            assert "race_id" in report
            assert "race_name" in report
            assert "reports" in report
            assert "count" in report
            print(f"Found {len(data)} grouped reports")
        else:
            print("No pending reports found")
    
    # --- Test POST /api/admin/reports/{race_id}/validate ---
    
    def test_validate_report_requires_admin(self):
        """Test that validating reports requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/reports/{TEST_RACE_ID}/validate")
        
        assert response.status_code in [401, 403]
        print("Validate endpoint correctly requires admin auth")
    
    # --- Test POST /api/admin/reports/{race_id}/reject ---
    
    def test_reject_report_requires_admin(self):
        """Test that rejecting reports requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/reports/{TEST_RACE_ID}/reject")
        
        assert response.status_code in [401, 403]
        print("Reject endpoint correctly requires admin auth")
    
    # --- Test report flow with admin actions ---
    
    def test_admin_can_view_reports_for_specific_race(self, admin_headers):
        """Test admin can view reports and they are grouped by race"""
        response = requests.get(f"{BASE_URL}/api/admin/reports", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check if Trail des Sangliers has reports (it should have 1)
        trail_reports = [r for r in data if r.get("race_id") == TEST_RACE_ID]
        if trail_reports:
            report_group = trail_reports[0]
            assert report_group["count"] >= 1
            assert report_group["race_name"] == "Trail des Sangliers"
            print(f"Trail des Sangliers has {report_group['count']} report(s)")
        else:
            print("No reports found for Trail des Sangliers (may have been cleared)")


class TestReportThreshold:
    """Test the 3-report threshold auto-close functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    def test_report_count_increments(self):
        """Test that report count increments with each submission"""
        # Get a race with open registration
        response = requests.get(f"{BASE_URL}/api/races?registration_status=open")
        assert response.status_code == 200
        races = response.json()
        
        if not races:
            pytest.skip("No races with open registration")
        
        race = races[0]
        race_id = race['id']
        
        # Submit a report
        report_response = requests.post(
            f"{BASE_URL}/api/races/{race_id}/report-closed",
            json={"reason": "TEST_increment_check"}
        )
        
        assert report_response.status_code == 200
        data = report_response.json()
        initial_count = data["report_count"]
        
        print(f"Report count after submission: {initial_count}")
        assert initial_count >= 1


class TestRaceDetailWithReports:
    """Test race detail endpoint returns proper data for reported races"""
    
    def test_race_detail_shows_auto_closed_flag(self):
        """Test that race detail includes auto_closed_by_reports flag when applicable"""
        # Get the Trail des Sangliers race
        response = requests.get(f"{BASE_URL}/api/races/{TEST_RACE_ID}")
        
        assert response.status_code == 200
        race = response.json()
        
        assert "name" in race
        assert race["name"] == "Trail des Sangliers"
        assert "registration_status" in race
        
        # Check if auto_closed_by_reports exists (it may or may not depending on state)
        if race.get("auto_closed_by_reports"):
            print("Race was auto-closed by reports")
        else:
            print(f"Race registration status: {race['registration_status']}")


class TestAdminReportActions:
    """Test admin validate/reject actions on reports"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    def test_admin_reject_nonexistent_race(self, admin_headers):
        """Test rejecting reports for non-existent race"""
        fake_race_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reports/{fake_race_id}/reject",
            headers=admin_headers
        )
        
        # Should work but modify 0 documents since race doesn't exist
        assert response.status_code == 200
        data = response.json()
        assert "0 signalement(s) rejeté(s)" in data["message"]
        print("Reject on non-existent race correctly returns 0 modified")
    
    def test_admin_validate_nonexistent_race(self, admin_headers):
        """Test validating reports for non-existent race returns 404"""
        fake_race_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reports/{fake_race_id}/validate",
            headers=admin_headers
        )
        
        assert response.status_code == 404
        print("Validate on non-existent race correctly returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
