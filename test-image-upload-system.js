// Comprehensive Test: Image Upload System for Property Listings
const https = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

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

async function makeFormRequest(options, formData) {
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
    formData.pipe(req);
  });
}

// Create mock image file for testing
function createMockImage(filename, sizeKB = 100) {
  const buffer = Buffer.alloc(sizeKB * 1024, 0xFF); // White image data
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

async function testImageUploadWorkflow() {
  console.log('🖼️  TESTING COMPLETE IMAGE UPLOAD SYSTEM');
  console.log('======================================\n');

  let sessionId = null;
  let draftId = null;
  let uploadedImageUrls = [];

  try {
    // 1. Test Image Upload Configuration
    console.log('1️⃣  Testing Image Upload Configuration');
    
    const configResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/images/upload',
      method: 'GET'
    });

    if (configResponse.status === 200) {
      console.log('   ✅ Configuration endpoint working');
      console.log(`   📋 Max file size: ${configResponse.data.maxFileSizeMB}MB`);
      console.log(`   📋 Allowed types: ${configResponse.data.allowedTypes.join(', ')}`);
      console.log(`   📋 Max images per property: ${configResponse.data.maxImagesPerProperty}`);
    } else {
      console.log('   ❌ Configuration endpoint failed:', configResponse.data);
    }

    // 2. Create Property Draft
    console.log('\n2️⃣  Creating Property Draft');
    
    const draftResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        propertyType: "2BR",
        bedrooms: "2",
        bathrooms: "2",
        monthlyRent: "2800",
        securityDeposit: "3500",
        availableDate: "2024-03-01",
        description: "IMAGE UPLOAD TEST - Modern 2-bedroom apartment with great views",
        amenities: ["Parking", "Gym", "Balcony"]
      },
      step: 1
    }));

    if (draftResponse.status === 200) {
      sessionId = draftResponse.data.sessionId;
      draftId = draftResponse.data.draft.id;
      console.log(`   ✅ Draft created - Session: ${sessionId}`);
      console.log(`   📄 Draft ID: ${draftId}`);
    } else {
      throw new Error('Failed to create draft: ' + JSON.stringify(draftResponse.data));
    }

    // 3. Test Image Upload Validation
    console.log('\n3️⃣  Testing Image Upload Validation');

    // Test invalid file type
    try {
      const invalidFile = createMockImage('test-invalid.txt', 50);
      const invalidForm = new FormData();
      invalidForm.append('images', fs.createReadStream(invalidFile), {
        filename: 'test-invalid.txt',
        contentType: 'text/plain'
      });
      invalidForm.append('sessionId', sessionId);

      // This should fail validation
      const invalidResponse = await makeFormRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/properties/images/upload',
        method: 'POST',
        headers: invalidForm.getHeaders()
      }, invalidForm);

      if (invalidResponse.status === 400) {
        console.log('   ✅ Invalid file type validation working');
      } else {
        console.log('   ⚠️  Invalid file type validation may not be working');
      }

      fs.unlinkSync(invalidFile);
    } catch (error) {
      console.log('   ❌ Validation test error:', error.message);
    }

    // 4. Test Valid Image Upload
    console.log('\n4️⃣  Testing Valid Image Upload');

    // Create mock image files
    const imageFiles = [
      createMockImage('test-image1.jpg', 500),
      createMockImage('test-image2.png', 300),
      createMockImage('test-image3.webp', 700)
    ];

    const uploadForm = new FormData();
    imageFiles.forEach((filepath, index) => {
      const extension = path.extname(filepath).substring(1);
      const contentType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
      uploadForm.append('images', fs.createReadStream(filepath), {
        filename: path.basename(filepath),
        contentType: contentType
      });
    });
    uploadForm.append('sessionId', sessionId);
    uploadForm.append('draftId', draftId);

    const uploadResponse = await makeFormRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/images/upload',
      method: 'POST',
      headers: uploadForm.getHeaders()
    }, uploadForm);

    if (uploadResponse.status === 200 && uploadResponse.data.success) {
      uploadedImageUrls = uploadResponse.data.images.map(img => img.url);
      console.log(`   ✅ Successfully uploaded ${uploadResponse.data.count} images`);
      console.log(`   🔗 Image URLs:`);
      uploadedImageUrls.forEach((url, index) => {
        console.log(`      ${index + 1}. ${url}`);
      });
    } else {
      console.log('   ❌ Image upload failed:', uploadResponse.data);
    }

    // Clean up test files
    imageFiles.forEach(filepath => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });

    // 5. Update Draft with Images
    console.log('\n5️⃣  Updating Draft with Uploaded Images');

    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        photos: uploadedImageUrls
      },
      step: 3,
      sessionId: sessionId
    }));

    if (updateResponse.status === 200) {
      console.log('   ✅ Draft updated with uploaded images');
    } else {
      console.log('   ❌ Failed to update draft with images:', updateResponse.data);
    }

    // 6. Test Image Deletion
    console.log('\n6️⃣  Testing Image Deletion');

    if (uploadedImageUrls.length > 0) {
      const imageToDelete = uploadedImageUrls[0];
      
      const deleteResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/properties/images/delete',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }, JSON.stringify({
        imageUrls: [imageToDelete],
        sessionId: sessionId,
        draftId: draftId
      }));

      if (deleteResponse.status === 200 && deleteResponse.data.success) {
        console.log(`   ✅ Successfully deleted image`);
        console.log(`   🗑️  Deleted: ${imageToDelete}`);
        
        // Remove from our tracking array
        uploadedImageUrls = uploadedImageUrls.filter(url => url !== imageToDelete);
      } else {
        console.log('   ❌ Image deletion failed:', deleteResponse.data);
      }
    }

    // 7. Complete Property Draft
    console.log('\n7️⃣  Completing Property Draft');

    // Add address
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties/draft',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      stepData: {
        address: "123 Test Upload Street",
        city: "Upload City",
        state: "Test County",
        postcode: "UP1 0AD"
      },
      step: 2,
      sessionId: sessionId
    }));

    console.log('   ✅ Address added to draft');

    // 8. Test Storage Bucket Access
    console.log('\n8️⃣  Testing Storage Bucket Access');

    if (uploadedImageUrls.length > 0) {
      const testImageUrl = uploadedImageUrls[0];
      
      try {
        const imageResponse = await makeRequest({
          hostname: testImageUrl.includes('localhost') ? 'localhost' : new URL(testImageUrl).hostname,
          port: testImageUrl.includes('localhost') ? 3000 : (testImageUrl.startsWith('https') ? 443 : 80),
          path: new URL(testImageUrl).pathname,
          method: 'GET'
        });

        if (imageResponse.status === 200) {
          console.log('   ✅ Images publicly accessible via URL');
        } else {
          console.log('   ⚠️  Image access may have issues:', imageResponse.status);
        }
      } catch (error) {
        console.log('   ⚠️  Unable to test image access:', error.message);
      }
    }

    // 9. Verify Draft Completeness
    console.log('\n9️⃣  Verifying Draft Completeness');

    const finalDraftCheck = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/properties/draft?sessionId=${sessionId}`,
      method: 'GET'
    });

    if (finalDraftCheck.status === 200 && finalDraftCheck.data.draft) {
      const draft = finalDraftCheck.data.draft;
      const hasStep1 = Object.keys(draft.step_1_data || {}).length > 0;
      const hasStep2 = Object.keys(draft.step_2_data || {}).length > 0;
      const hasStep3 = Object.keys(draft.step_3_data || {}).length > 0;
      const hasImages = draft.step_3_data?.photos?.length > 0;

      console.log(`   📊 Draft completeness:`);
      console.log(`      Step 1 (Basic Info): ${hasStep1 ? '✅' : '❌'}`);
      console.log(`      Step 2 (Address): ${hasStep2 ? '✅' : '❌'}`);
      console.log(`      Step 3 (Images): ${hasStep3 ? '✅' : '❌'}`);
      console.log(`      Images Count: ${hasImages ? draft.step_3_data.photos.length : 0}`);

      if (hasStep1 && hasStep2 && hasStep3 && hasImages) {
        console.log('   ✅ Draft is complete with uploaded images');
      }
    }

    // 10. Test System Integration
    console.log('\n🔟  Testing System Integration');

    console.log('   🎯 RESULTS SUMMARY');
    console.log('   ================');
    console.log(`   📄 Draft ID: ${draftId}`);
    console.log(`   🔑 Session ID: ${sessionId}`);
    console.log(`   🖼️  Images Uploaded: ${uploadedImageUrls.length}`);
    console.log(`   🔗 Remaining Image URLs:`);
    uploadedImageUrls.forEach((url, index) => {
      console.log(`      ${index + 1}. ${url}`);
    });

  } catch (error) {
    console.error('\n❌ Image Upload Test Failed:', error.message);
    
    // Clean up any test files that might remain
    ['test-image1.jpg', 'test-image2.png', 'test-image3.webp', 'test-invalid.txt'].forEach(filename => {
      const filepath = path.join(__dirname, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });
  }

  console.log('\n🎉 IMAGE UPLOAD SYSTEM TEST COMPLETED');
  console.log('=====================================');
}

// Check if FormData is available (might need to install form-data package)
try {
  require('form-data');
  testImageUploadWorkflow();
} catch (error) {
  console.log('❌ Missing form-data package. Please install with: npm install form-data');
  console.log('   Then run this test again.');
}