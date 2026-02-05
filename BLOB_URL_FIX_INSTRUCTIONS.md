# Fixing Blob URL Issues in Property Images

## Problem
Some properties have invalid blob URLs (e.g., `blob:https://www.aceinvestmentproperties.co.uk/...`) saved in the database instead of actual Supabase storage URLs. These blob URLs don't work and cause images to not display on the website.

## Root Cause
Blob URLs are temporary client-side URLs created for file previews. They were accidentally saved to the database instead of the actual uploaded image URLs from Supabase storage.

## Prevention (Already Fixed)
The code has been updated to prevent this from happening again:
- `components/edit-property-form.tsx` - Now filters out blob URLs before saving
- `components/add-property-form.tsx` - Enhanced filtering to reject blob URLs

## Fixing Existing Data

### Step 1: Analyze the Problem
To see how many properties are affected:

```bash
# In your browser console or API client, make a GET request:
GET /api/admin/fix-blob-urls
Authorization: Bearer YOUR_ADMIN_TOKEN
```

This will return:
```json
{
  "success": true,
  "analysis": {
    "total": 150,
    "withPhotos": 120,
    "withoutPhotos": 30,
    "withBlobUrls": 15,
    "withValidUrls": 105,
    "propertiesWithBlobUrls": [
      {
        "id": "property-id-1",
        "address": "123 Main St",
        "city": "London",
        "photos": ["blob:https://...", "http://valid-url.com/image.jpg"]
      }
    ]
  }
}
```

### Step 2: Fix the Data

You have two options:

#### Option A: Remove Only Blob URLs (Recommended)
This keeps valid image URLs and only removes blob URLs:

```bash
POST /api/admin/fix-blob-urls
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "action": "remove_blob_urls"
}
```

#### Option B: Clear All Photos for Affected Properties
This removes ALL photos from properties that have blob URLs (use if all images are broken):

```bash
POST /api/admin/fix-blob-urls
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "action": "clear_all_photos"
}
```

### Step 3: Have Landlords Re-upload Images

After clearing the broken URLs, affected landlords should:
1. Edit their properties
2. Upload new images
3. Save the property

The new images will be properly uploaded to Supabase storage.

## Using the Admin Endpoint in Browser

1. Log in as admin on the website
2. Open browser DevTools (F12)
3. Go to Console tab
4. Get your access token:

```javascript
// Get session token
const { data: { session } } = await supabase.auth.getSession()
const token = session.access_token
console.log('Token:', token)
```

5. Analyze the problem:

```javascript
const analyzeResponse = await fetch('/api/admin/fix-blob-urls', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const analyzeData = await analyzeResponse.json()
console.log('Analysis:', analyzeData)
```

6. Fix the data:

```javascript
const fixResponse = await fetch('/api/admin/fix-blob-urls', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'remove_blob_urls'
  })
})
const fixData = await fixResponse.json()
console.log('Fix Result:', fixData)
```

## Verifying the Fix

After running the fix:
1. Refresh the property listings page
2. Check that properties without images show the "No photo" placeholder
3. Properties with valid images should display them correctly
4. Properties with blob URLs should now show "No photo" instead of broken images

## Next Steps

For properties now showing "No photo":
1. Contact the landlords to re-upload their images
2. Or batch upload images if you have access to the original files

The image upload flow now ensures only valid Supabase storage URLs are saved to the database.
