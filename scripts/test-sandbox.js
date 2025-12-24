#!/usr/bin/env node

/**
 * pVerify API Sandbox Test Script
 * 
 * This script tests connectivity and basic operations against the pVerify sandbox.
 * 
 * Usage:
 *   PVERIFY_CLIENT_ID=xxx PVERIFY_CLIENT_SECRET=xxx node scripts/test-sandbox.js
 */

const https = require('https');

const CLIENT_ID = process.env.PVERIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.PVERIFY_CLIENT_SECRET;
const BASE_URL = 'api.pverify.com';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: PVERIFY_CLIENT_ID and PVERIFY_CLIENT_SECRET environment variables are required');
  console.error('');
  console.error('Usage:');
  console.error('  PVERIFY_CLIENT_ID=xxx PVERIFY_CLIENT_SECRET=xxx node scripts/test-sandbox.js');
  process.exit(1);
}

console.log('pVerify Sandbox Test Script');
console.log('===========================');
console.log('');

/**
 * Make an HTTPS request
 */
function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Get OAuth2 access token
 */
async function getToken() {
  console.log('1. Testing Authentication...');
  
  const postData = `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;
  
  const options = {
    hostname: BASE_URL,
    path: '/Token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const response = await request(options, postData);
  
  if (response.statusCode === 200 && response.body.access_token) {
    console.log('   ✓ Authentication successful');
    console.log(`   Token expires in: ${response.body.expires_in} seconds`);
    return response.body.access_token;
  } else {
    console.log('   ✗ Authentication failed');
    console.log('   Response:', JSON.stringify(response.body, null, 2));
    throw new Error('Authentication failed');
  }
}

/**
 * Get payer list
 */
async function getPayerList(token) {
  console.log('');
  console.log('2. Testing Payer List...');
  
  const options = {
    hostname: BASE_URL,
    path: '/API/GetAllPayers?maxResults=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const response = await request(options);
  
  if (response.statusCode === 200) {
    const payers = response.body.PayerList || response.body.payerList || [];
    console.log(`   ✓ Retrieved ${payers.length} payers (limited to 5)`);
    
    if (payers.length > 0) {
      console.log('   Sample payers:');
      payers.slice(0, 3).forEach(p => {
        console.log(`     - ${p.PayerCode || p.payerCode}: ${p.PayerName || p.payerName}`);
      });
    }
    return payers;
  } else {
    console.log('   ✗ Failed to get payer list');
    console.log('   Response:', JSON.stringify(response.body, null, 2));
    return [];
  }
}

/**
 * Test eligibility summary (sandbox test request)
 */
async function testEligibilitySummary(token) {
  console.log('');
  console.log('3. Testing Eligibility Summary (sandbox test)...');
  
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  
  const requestBody = JSON.stringify({
    payerCode: '00001',
    provider: {
      npi: '1234567890'
    },
    subscriber: {
      memberId: 'TEST123456',
      firstName: 'John',
      lastName: 'Doe',
      dob: '03/15/1985'
    },
    isSubscriberPatient: true,
    doS_StartDate: dateStr,
    doS_EndDate: dateStr
  });
  
  const options = {
    hostname: BASE_URL,
    path: '/API/EligibilitySummary',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };
  
  const response = await request(options, requestBody);
  
  if (response.statusCode === 200) {
    console.log('   ✓ Eligibility Summary request successful');
    console.log('   Response code:', response.body.APIResponseCode || response.body.apiResponseCode || 'N/A');
    console.log('   Eligibility status:', response.body.EligibilityStatus || response.body.eligibilityStatus || 'N/A');
    
    if (response.body.PlanCoverageSummary || response.body.planCoverageSummary) {
      const plan = response.body.PlanCoverageSummary || response.body.planCoverageSummary;
      console.log('   Plan name:', plan.PlanName || plan.planName || 'N/A');
    }
  } else {
    console.log('   ✗ Eligibility Summary request failed');
    console.log('   Status:', response.statusCode);
    console.log('   Response:', JSON.stringify(response.body, null, 2));
  }
}

/**
 * Search payer by name
 */
async function searchPayerByName(token, name) {
  console.log('');
  console.log(`4. Testing Payer Search for "${name}"...`);
  
  const options = {
    hostname: BASE_URL,
    path: `/API/GetPayerByName?name=${encodeURIComponent(name)}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const response = await request(options);
  
  if (response.statusCode === 200) {
    const payers = response.body.PayerList || response.body.payerList || [];
    console.log(`   ✓ Found ${payers.length} matching payers`);
    
    payers.slice(0, 5).forEach(p => {
      console.log(`     - ${p.PayerCode || p.payerCode}: ${p.PayerName || p.payerName}`);
    });
  } else {
    console.log('   ✗ Payer search failed');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    // Test 1: Authentication
    const token = await getToken();
    
    // Test 2: Payer List
    await getPayerList(token);
    
    // Test 3: Eligibility Summary
    await testEligibilitySummary(token);
    
    // Test 4: Payer Search
    await searchPayerByName(token, 'Aetna');
    
    console.log('');
    console.log('===========================');
    console.log('All tests completed!');
    console.log('');
    console.log('Note: Sandbox returns mock data. For real verification,');
    console.log('use production credentials with actual patient information.');
    
  } catch (error) {
    console.error('');
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
