#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TrailFranceAPITester:
    def __init__(self, base_url="https://trouve-ton-dossard.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (expected {expected_status})"
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        details += f" - {error_data['detail']}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_seed_data(self):
        """Test seeding the database"""
        print("\n🌱 Testing database seeding...")
        result = self.run_test("Seed database", "POST", "", 200)
        return result is not None

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing authentication...")
        
        # Test admin login
        admin_data = {
            "email": "admin@trailfrance.com",
            "password": "admin123"
        }
        result = self.run_test("Admin login", "POST", "auth/login", 200, admin_data)
        if result and 'access_token' in result:
            self.admin_token = result['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
        
        # Test user registration
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "testpass123",
            "name": "Test User"
        }
        result = self.run_test("User registration", "POST", "auth/register", 200, test_user_data)
        if result and 'access_token' in result:
            self.token = result['access_token']
            print(f"   User token obtained: {self.token[:20]}...")
        
        # Test user login with same credentials
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        self.run_test("User login", "POST", "auth/login", 200, login_data)
        
        # Test /me endpoint
        if self.token:
            self.run_test("Get current user", "GET", "auth/me", 200)
        
        # Test invalid login
        invalid_data = {
            "email": "invalid@test.com",
            "password": "wrongpass"
        }
        self.run_test("Invalid login (should fail)", "POST", "auth/login", 401, invalid_data)

    def test_races_endpoints(self):
        """Test races endpoints"""
        print("\n🏃 Testing races endpoints...")
        
        # Get all races
        result = self.run_test("Get all races", "GET", "races", 200)
        races = result if result else []
        
        if races:
            race_id = races[0]['id']
            print(f"   Found {len(races)} races, testing with race ID: {race_id}")
            
            # Get specific race
            self.run_test("Get race by ID", "GET", f"races/{race_id}", 200)
            
            # Test race filters
            self.run_test("Filter by region", "GET", "races?region=Auvergne", 200)
            self.run_test("Filter by UTMB", "GET", "races?is_utmb=true", 200)
            self.run_test("Filter by distance", "GET", "races?min_distance=50&max_distance=100", 200)
            self.run_test("Search races", "GET", "races?search=UTMB", 200)
            self.run_test("Filter by registration status", "GET", "races?registration_status=open", 200)
        
        # Test non-existent race
        self.run_test("Get non-existent race (should fail)", "GET", "races/nonexistent", 404)
        
        # Test creating race (requires auth)
        if self.token:
            new_race_data = {
                "name": "Test Trail Race",
                "description": "A test trail race for API testing",
                "location": "Test City",
                "region": "Test Region",
                "department": "Test Department",
                "latitude": 45.0,
                "longitude": 2.0,
                "distance_km": 25.0,
                "elevation_gain": 1000,
                "race_date": "2025-09-15",
                "registration_open_date": "2025-03-01",
                "registration_close_date": "2025-08-31",
                "is_utmb": False,
                "website_url": "https://test-race.com"
            }
            result = self.run_test("Create new race", "POST", "races", 200, new_race_data)
            if result:
                created_race_id = result.get('id')
                print(f"   Created race with ID: {created_race_id}")
                
                # Test updating the race
                update_data = {
                    "name": "Updated Test Trail Race",
                    "distance_km": 30.0
                }
                self.run_test("Update race", "PUT", f"races/{created_race_id}", 200, update_data)

    def test_favorites_endpoints(self):
        """Test favorites endpoints"""
        print("\n❤️ Testing favorites endpoints...")
        
        if not self.token:
            print("   Skipping favorites tests - no user token")
            return
        
        # Get user favorites (should be empty initially)
        self.run_test("Get user favorites", "GET", "favorites", 200)
        
        # Get races to add to favorites
        races_result = self.run_test("Get races for favorites test", "GET", "races", 200)
        if races_result and len(races_result) > 0:
            race_id = races_result[0]['id']
            
            # Add to favorites
            self.run_test("Add race to favorites", "POST", f"favorites/{race_id}", 200)
            
            # Get favorites again (should have 1 item)
            self.run_test("Get favorites after adding", "GET", "favorites", 200)
            
            # Toggle notification
            self.run_test("Toggle favorite notification", "PUT", f"favorites/{race_id}/notify?notify=false", 200)
            
            # Remove from favorites
            self.run_test("Remove from favorites", "DELETE", f"favorites/{race_id}", 200)
            
            # Try to add same race again
            self.run_test("Add race to favorites again", "POST", f"favorites/{race_id}", 200)
            
            # Try to add duplicate (should fail)
            self.run_test("Add duplicate favorite (should fail)", "POST", f"favorites/{race_id}", 400)

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n👑 Testing admin endpoints...")
        
        if not self.admin_token:
            print("   Skipping admin tests - no admin token")
            return
        
        # Temporarily set admin token
        original_token = self.token
        self.token = self.admin_token
        
        # Get pending races
        self.run_test("Get pending races", "GET", "admin/pending", 200)
        
        # Create a race as regular user first, then moderate it
        self.token = original_token  # Switch back to user token
        if self.token:
            pending_race_data = {
                "name": "Pending Test Race",
                "description": "A race that needs moderation",
                "location": "Pending City",
                "region": "Pending Region", 
                "department": "Pending Department",
                "latitude": 46.0,
                "longitude": 3.0,
                "distance_km": 15.0,
                "elevation_gain": 500,
                "race_date": "2025-10-15",
                "registration_open_date": "2025-04-01",
                "is_utmb": False
            }
            result = self.run_test("Create race for moderation", "POST", "races", 200, pending_race_data)
            
            if result:
                pending_race_id = result.get('id')
                
                # Switch back to admin token
                self.token = self.admin_token
                
                # Moderate the race (approve)
                moderate_data = {"action": "approve"}
                self.run_test("Approve pending race", "POST", f"admin/moderate/{pending_race_id}", 200, moderate_data)
        
        # Restore original token
        self.token = original_token

    def test_filter_endpoints(self):
        """Test filter data endpoints"""
        print("\n🔍 Testing filter endpoints...")
        
        self.run_test("Get regions", "GET", "filters/regions", 200)
        self.run_test("Get departments", "GET", "filters/departments", 200)
        self.run_test("Get departments by region", "GET", "filters/departments?region=Auvergne-Rhône-Alpes", 200)

    def test_user_settings(self):
        """Test user settings endpoints"""
        print("\n⚙️ Testing user settings...")
        
        if not self.token:
            print("   Skipping user settings tests - no user token")
            return
        
        # Update email notifications setting
        self.run_test("Update email notifications", "PUT", "users/settings?email_notifications=false", 200)
        self.run_test("Update email notifications back", "PUT", "users/settings?email_notifications=true", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Trail France API Tests")
        print("=" * 50)
        
        # Test in logical order
        self.test_seed_data()
        self.test_auth_endpoints()
        self.test_races_endpoints()
        self.test_favorites_endpoints()
        self.test_admin_endpoints()
        self.test_filter_endpoints()
        self.test_user_settings()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = TrailFranceAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())