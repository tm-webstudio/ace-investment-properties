/**
 * Geocode an address using OpenStreetMap's Nominatim API
 * Returns latitude and longitude coordinates
 */
export async function geocodeAddress(
  address: string,
  city: string,
  postcode?: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Build the query string
    const parts = [address, city, postcode, 'UK'].filter(Boolean)
    const query = parts.join(', ')

    // Use Nominatim API (free, no key needed)
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ACE Investment Properties (property rental platform)', // Nominatim requires a User-Agent
      },
    })

    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return null
    }

    const data = await response.json()

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      }
    }

    console.warn('No geocoding results found for:', query)
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Geocode multiple addresses with rate limiting
 * Nominatim has a rate limit of 1 request per second
 */
export async function geocodeAddresses(
  addresses: Array<{
    id: string
    address: string
    city: string
    postcode?: string
  }>
): Promise<Array<{
  id: string
  latitude: number | null
  longitude: number | null
}>> {
  const results: Array<{
    id: string
    latitude: number | null
    longitude: number | null
  }> = []

  for (const addr of addresses) {
    const coords = await geocodeAddress(addr.address, addr.city, addr.postcode)

    results.push({
      id: addr.id,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
    })

    // Wait 1 second between requests to respect rate limit
    if (addresses.indexOf(addr) < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
