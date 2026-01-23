#!/usr/bin/env node

// Comprehensive API test for Doctor Appointment System
import dotenv from 'dotenv';
dotenv.config();

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002/api/appointments';
const API_BASE = process.env.API_BASE || 'http://localhost:3002';

// Sample data from api-samples.json
const sampleAppointments = [
  {
    name: "Sample Appointment 1",
    body: {
      DocID: "DOC001",
      PatientID: "PAT001", 
      PatientEmail: "john.doe@example.com",
      PatientAddress: "123 Main St, New York, NY 10001",
      PatientAppointmentDate: "2026-01-25T10:00:00.000Z"
    }
  },
  {
    name: "Sample Appointment 2", 
    body: {
      DocID: "DOC002",
      PatientID: "PAT002",
      PatientEmail: "jane.smith@example.com", 
      PatientAddress: "456 Oak Ave, Los Angeles, CA 90001",
      PatientAppointmentDate: "2026-01-26T14:30:00.000Z"
    }
  },
  {
    name: "Sample Appointment 3",
    body: {
      DocID: "DOC003",
      PatientID: "PAT003",
      PatientEmail: "bob.wilson@example.com",
      PatientAddress: "789 Pine Rd, Chicago, IL 60601", 
      PatientAppointmentDate: "2026-01-27T09:15:00.000Z"
    }
  }
];

// Helper function to make HTTP requests
async function makeRequest(method, url, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

// Test function
async function runTests() {
  console.log('🚀 Starting Doctor Appointment System API Tests\n');
  console.log(`📡 Base URL: ${BASE_URL}`);
  
  const results = {
    created: [],
    tests: []
  };
  
  // Test 1: Create appointments
  console.log('\n📝 Testing POST /api/appointments (Create appointments)');
  for (const sample of sampleAppointments) {
    console.log(`\nCreating: ${sample.name}`);
    const result = await makeRequest('POST', BASE_URL, sample.body);
    
    if (result.ok) {
      console.log(`✅ Created successfully - ID: ${result.data._id}`);
      results.created.push({ ...sample, id: result.data._id, response: result.data });
    } else {
      console.log(`❌ Failed: ${result.status} - ${JSON.stringify(result.data)}`);
    }
    results.tests.push({ test: `Create ${sample.name}`, result });
  }
  
  // Test 2: Get all appointments
  console.log('\n📋 Testing GET /api/appointments (Get all appointments)');
  const getAllResult = await makeRequest('GET', BASE_URL);
  if (getAllResult.ok) {
    console.log(`✅ Retrieved ${getAllResult.data.data?.length || 0} appointments`);
    console.log(`📊 Response: ${JSON.stringify(getAllResult.data, null, 2)}`);
  } else {
    console.log(`❌ Failed: ${getAllResult.status} - ${JSON.stringify(getAllResult.data)}`);
  }
  results.tests.push({ test: 'Get all appointments', result: getAllResult });
  
  // Test 3: Get appointment by ID
  if (results.created.length > 0) {
    console.log('\n🔍 Testing GET /api/appointments/:id (Get by ID)');
    const firstAppointment = results.created[0];
    const getByIdResult = await makeRequest('GET', `${BASE_URL}/${firstAppointment.id}`);
    
    if (getByIdResult.ok) {
      console.log(`✅ Retrieved appointment: ${firstAppointment.name}`);
      console.log(`📋 Response: ${JSON.stringify(getByIdResult.data, null, 2)}`);
    } else {
      console.log(`❌ Failed: ${getByIdResult.status} - ${JSON.stringify(getByIdResult.data)}`);
    }
    results.tests.push({ test: 'Get by ID', result: getByIdResult });
    
    // Test 4: Delete appointment
    console.log('\n🗑️ Testing DELETE /api/appointments/:id (Delete appointment)');
    const deleteResult = await makeRequest('DELETE', `${BASE_URL}/${firstAppointment.id}`);
    
    if (deleteResult.ok) {
      console.log(`✅ Deleted appointment: ${firstAppointment.name}`);
      console.log(`📋 Response: ${JSON.stringify(deleteResult.data, null, 2)}`);
    } else {
      console.log(`❌ Failed: ${deleteResult.status} - ${JSON.stringify(deleteResult.data)}`);
    }
    results.tests.push({ test: 'Delete appointment', result: deleteResult });
  }
  
  // Test 5: Error handling - Get non-existent appointment
  console.log('\n🚫 Testing error handling - GET non-existent appointment');
  const errorResult = await makeRequest('GET', `${BASE_URL}/507f1f77bcf86cd799439011`);
  if (errorResult.status === 404) {
    console.log('✅ 404 error handled correctly');
  } else {
    console.log(`❌ Unexpected response: ${errorResult.status} - ${JSON.stringify(errorResult.data)}`);
  }
  results.tests.push({ test: 'Error handling', result: errorResult });
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  const passed = results.tests.filter(t => t.result.ok || t.result.status === 404).length;
  const total = results.tests.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (results.created.length > 0) {
    console.log('\n📝 Created Appointments:');
    results.created.forEach((app, i) => {
      console.log(`${i + 1}. ${app.name} - ID: ${app.id}`);
    });
  }
  
  console.log('\n🎉 Testing completed!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, sampleAppointments };