// Test Form Integration - Verify drafts are saved on publish
const https = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testFormIntegration() {
  console.log('🧪 TESTING FORM INTEGRATION - DRAFT SAVING ON PUBLISH');
  console.log('======================================================\n');

  try {
    console.log('1️⃣  Testing Complete Form Workflow');
    
    // Step 1: Create initial draft
    const step1Response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        propertyType: "1BR",
        bedrooms: "1",
        bathrooms: "1",
        monthlyRent: "1600",
        securityDeposit: "2000",
        availableDate: "2024-06-01",
        description: "FORM INTEGRATION TEST - Cozy 1-bedroom apartment",
        amenities: ["Parking", "WiFi"]
      },
      step: 1
    }));

    if (step1Response.status !== 200) {
      throw new Error('Step 1 failed: ' + JSON.stringify(step1Response.data));
    }

    const { sessionId, draft } = step1Response.data;
    console.log(`   ✅ Step 1 created - Session: ${sessionId}`);

    // Step 2: Add address
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        address: "456 Integration Test Street",
        city: "Test City",
        state: "Test County",
        postcode: "TE5 7ST"
      },
      step: 2,
      sessionId: sessionId
    }));

    console.log('   ✅ Step 2 completed - Address added');

    // Step 3: Add photos
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
      },
      step: 3,
      sessionId: sessionId
    }));

    console.log('   ✅ Step 3 completed - Photos added');

    // Step 4: Complete and attempt publish
    console.log('\n2️⃣  Testing Publish Workflow');
    
    const publishResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/publish',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      sessionId: sessionId,
      draftId: draft.id,
      contactInfo: {
        contactName: "Test Contact",
        contactEmail: "test@example.com",
        contactPhone: "+44 7777 888999"
      }
    }));

    console.log(`   📋 Publish Status: ${publishResponse.status}`);
    console.log(`   📄 Response: ${JSON.stringify(publishResponse.data, null, 2)}`);

    // Verify draft still exists after publish attempt
    console.log('\n3️⃣  Verifying Draft Persistence');
    
    const draftCheckResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/properties/draft?sessionId=${sessionId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (draftCheckResponse.status === 200 && draftCheckResponse.data.draft) {
      console.log('   ✅ Draft persisted after publish attempt');
      console.log('   📊 Draft current step:', draftCheckResponse.data.draft.current_step);
      console.log('   🆔 Draft ID:', draftCheckResponse.data.draft.id);
      
      // Check if all data is complete
      const d = draftCheckResponse.data.draft;
      const hasStep1 = Object.keys(d.step_1_data || {}).length > 0;
      const hasStep2 = Object.keys(d.step_2_data || {}).length > 0;
      const hasStep3 = Object.keys(d.step_3_data || {}).length > 0;
      
      console.log(`   📝 Data completeness: Step1(${hasStep1}) Step2(${hasStep2}) Step3(${hasStep3})`);
      
      if (hasStep1 && hasStep2 && hasStep3) {
        console.log('   ✅ ALL FORM DATA SAVED SUCCESSFULLY');
      } else {
        console.log('   ❌ Some form data missing');
      }
    } else {
      console.log('   ❌ Draft not found - this is the issue!');
    }

    console.log('\n🎯 INTEGRATION TEST RESULTS');
    console.log('===========================');
    
    if (publishResponse.status === 401 && publishResponse.data.requiresSignup) {
      console.log('✅ Auth flow working correctly');
    } else {
      console.log('⚠️  Unexpected auth flow');
    }

    if (draftCheckResponse.status === 200) {
      console.log('✅ Draft persistence working');
    } else {
      console.log('❌ Draft NOT persisting - ISSUE IDENTIFIED');
    }

    console.log(`\n🔗 Test artifacts:`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Draft ID: ${draft.id}`);

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
  }
}

testFormIntegration();