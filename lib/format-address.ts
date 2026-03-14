/**
 * Convert string to sentence case (capitalize first letter of each word)
 * Handles special cases like "and", "of", "the" properly
 */
function toSentenceCase(text: string): string {
  if (!text) return ''

  // Words that should typically stay lowercase (unless they're the first word)
  const lowercaseWords = new Set(['and', 'of', 'the', 'in', 'on', 'at', 'to', 'a', 'an'])

  // UK postcode pattern: 1-2 letters + 1-2 digits + optional digit/letter (e.g., SE26, UB7, M34, SW1A)
  const postcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?$/i

  return text
    .split(' ')
    .map((word, index) => {
      // Keep postcode-like tokens fully uppercase
      if (postcodePattern.test(word)) {
        return word.toUpperCase()
      }
      const lower = word.toLowerCase()
      // Always capitalize first word, or if not in lowercase set
      if (index === 0 || !lowercaseWords.has(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      }
      return lower
    })
    .join(' ')
}

/**
 * Strip trailing city and/or outward postcode from an address string.
 * Handles cases where the address field already contains "Road, City, PC"
 * to avoid duplication like "Road, City, PC, City, PC".
 */
function stripTrailingSuffixes(addr: string, city?: string, outwardPostcode?: string): string {
  if (!addr) return addr

  // Split on comma, trim each segment
  const segments = addr.split(',').map(s => s.trim())
  const normCity = city ? city.toLowerCase().trim() : ''
  const normPC = outwardPostcode ? outwardPostcode.toLowerCase() : ''

  // Remove trailing segments that match outward postcode or city (in reverse order)
  while (segments.length > 1) {
    const last = segments[segments.length - 1].toLowerCase().trim()
    if ((normPC && last === normPC) || (normCity && last === normCity)) {
      segments.pop()
    } else {
      break
    }
  }

  return segments.join(', ')
}

/**
 * Format property title - standard format: "road name, area, outward postcode"
 * Removes street numbers and apartment/flat designations for a clean title
 * Always formats in sentence case except postcode (which is uppercase)
 *
 * @param address - Street address (e.g., "123 HIGH STREET, Apartment 4B" or "123 high street")
 * @param city - City/area (e.g., "london" or "LONDON")
 * @param postcode - Full postcode (e.g., "sw1a 1aa" or "SW1A 1AA")
 * @returns Formatted title (e.g., "High Street, London, SW1A")
 */
export function formatPropertyTitle(
  address: string,
  city?: string,
  postcode?: string
): string {
  let roadName = address

  // Remove leading numbers and common address prefixes
  roadName = roadName.replace(/^\d+\s*/, '') // Remove leading numbers
  roadName = roadName.replace(/^(Flat|Apartment|Unit|Suite)\s+\d+[A-Z]?\s*,?\s*/i, '') // Remove flat/apartment numbers
  roadName = roadName.replace(/,\s*(Flat|Apartment|Unit|Suite)\s+.*$/i, '') // Remove trailing flat info
  roadName = roadName.trim()

  const parts: string[] = []

  const outwardPostcode = postcode ? postcode.trim().split(' ')[0].toUpperCase() : ''

  // Strip trailing city/postcode if address already contains them
  roadName = stripTrailingSuffixes(roadName, city, outwardPostcode)

  // Check if the road name is just a duplicate of city/postcode (bad data)
  const normRoad = roadName.toLowerCase().replace(/[,\s]+/g, ' ').trim()
  const normCity = city ? city.toLowerCase().trim() : ''
  const isDuplicate = normRoad === normCity
    || normRoad === `${normCity} ${outwardPostcode.toLowerCase()}`
    || normRoad === outwardPostcode.toLowerCase()

  if (roadName && !isDuplicate) {
    // Convert to sentence case
    parts.push(toSentenceCase(roadName))
  }

  if (city) {
    // Convert to sentence case
    parts.push(toSentenceCase(city.trim()))
  }

  if (outwardPostcode) {
    parts.push(outwardPostcode)
  }

  return parts.join(', ')
}

/**
 * Format full property address in the standard format: "address, area, outward postcode"
 * Keeps street numbers for complete address display
 * Always formats in sentence case except postcode (which is uppercase)
 *
 * @param address - Street address (e.g., "123 high street" or "123 HIGH STREET")
 * @param city - City/area (e.g., "london" or "LONDON")
 * @param postcode - Full postcode (e.g., "sw1a 1aa" or "SW1A 1AA")
 * @returns Formatted address string (e.g., "123 High Street, London, SW1A")
 */
export function formatPropertyAddress(
  address: string,
  city?: string,
  postcode?: string
): string {
  const parts: string[] = []

  const outwardPostcode = postcode ? postcode.trim().split(' ')[0].toUpperCase() : ''

  if (address) {
    // Strip trailing city/postcode if address already contains them
    const cleanAddr = stripTrailingSuffixes(address.trim(), city, outwardPostcode)

    // Check if the address is just a duplicate of city/postcode (bad data)
    const normAddr = cleanAddr.toLowerCase().replace(/[,\s]+/g, ' ').trim()
    const normCity = city ? city.toLowerCase().trim() : ''
    const isDuplicate = normAddr === normCity
      || normAddr === `${normCity} ${outwardPostcode.toLowerCase()}`
      || normAddr === outwardPostcode.toLowerCase()

    if (!isDuplicate) {
      parts.push(toSentenceCase(cleanAddr))
    }
  }

  if (city) {
    // Convert to sentence case
    parts.push(toSentenceCase(city.trim()))
  }

  // Add outward postcode (first part before the space) - always uppercase
  if (outwardPostcode) {
    parts.push(outwardPostcode)
  }

  return parts.join(', ')
}

/**
 * Convenience wrapper that takes a property object and delegates to formatPropertyTitle
 */
export function formatPropertyTitleFromProperty(
  property: { address?: string; city?: string; postcode?: string }
): string {
  return formatPropertyTitle(property.address || '', property.city, property.postcode)
}
