require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(address, city, postcode) {
  try {
    const parts = [address, city, postcode, 'UK'].filter(Boolean);
    const query = parts.join(', ');

    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ACE Investment Properties',
      },
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding:', error);
    return null;
  }
}

async function main() {
  console.log('Fetching properties without coordinates...');

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, address, city, postcode')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('Error fetching properties:', error);
    process.exit(1);
  }

  console.log(`Found ${properties.length} properties to geocode`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`\n[${i + 1}/${properties.length}] Geocoding: ${property.address}, ${property.city}`);

    const coords = await geocodeAddress(property.address, property.city, property.postcode);

    if (coords) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
        .eq('id', property.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Success: ${coords.latitude}, ${coords.longitude}`);
        successCount++;
      }
    } else {
      console.log(`  ⚠️  Could not geocode address`);
      failCount++;
    }

    // Wait 1.1 seconds between requests to respect rate limit
    if (i < properties.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }

  console.log(`\n✨ Done! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
