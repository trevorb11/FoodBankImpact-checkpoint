// Test script for handling duplicate emails
import { exec } from 'child_process';

// Test donor data with duplicates
const donorData = [
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "total_giving": 150
  },
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "total_giving": 300
  },
  // Duplicate email with different information
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "total_giving": 200
  },
  {
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "total_giving": 500
  }
];

// Create test request to upload donors
const requestData = {
  fileName: "Test Upload With Duplicates",
  description: "Testing duplicate email handling",
  donors: donorData
};

// Login with the credentials we just created
console.log('Attempting to login...');
exec('curl -s -c cookies.txt -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d \'{"username":"duplicatetester", "password":"testpass123"}\'', 
  (err, stdout, stderr) => {
    if (err) {
      console.error('Login error:', err);
      return;
    }
    
    try {
      const loginResponse = JSON.parse(stdout);
      console.log('Login response:', loginResponse);
      
      if (loginResponse.message === 'Invalid credentials') {
        console.log('Login failed. Please check the credentials.');
        return;
      } else if (loginResponse.id) {
        // Login successful
        testDuplicateUpload();
      } else {
        console.log('Unknown login response. Please check the logs.');
      }
    } catch (parseErr) {
      console.error('Error parsing login response:', parseErr);
    }
  }
);

function testDuplicateUpload() {
  console.log('Testing duplicate email upload...');
  
  // Now try to upload donors with duplicates
  exec(`curl -s -b cookies.txt -X POST "http://localhost:5000/api/donors/upload" -H "Content-Type: application/json" -d '${JSON.stringify(requestData)}'`, 
    (uploadErr, uploadStdout, uploadStderr) => {
      if (uploadErr) {
        console.error('Upload error:', uploadErr);
        return;
      }
      
      try {
        const uploadResponse = JSON.parse(uploadStdout);
        console.log('Upload response:', uploadResponse);
      } catch (parseErr) {
        console.error('Error parsing upload response:', parseErr, 'Raw response:', uploadStdout);
      }
    }
  );
}