/**
 * Convert string to sentence case (capitalize first letter of each word)
 * Handles special cases like "and", "of", "the" properly
 */
function toSentenceCase(text: string): string {
  if (!text) return ''

  // Words that should typically stay lowercase (unless they're the first word)
  const lowercaseWords = new Set(['and', 'of', 'the', 'in', 'on', 'at', 'to', 'a', 'an'])

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word, or if not in lowercase set
      if (index === 0 || !lowercaseWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
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

  if (roadName) {
    // Convert to sentence case
    parts.push(toSentenceCase(roadName))
  }

  if (city) {
    // Convert to sentence case
    parts.push(toSentenceCase(city.trim()))
  }

  if (postcode) {
    // Extract outward postcode and convert to uppercase
    const outwardPostcode = postcode.trim().split(' ')[0]
    if (outwardPostcode) {
      parts.push(outwardPostcode.toUpperCase())
    }
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

  if (address) {
    // Convert to sentence case
    parts.push(toSentenceCase(address.trim()))
  }

  if (city) {
    // Convert to sentence case
    parts.push(toSentenceCase(city.trim()))
  }

  // Add outward postcode (first part before the space) - always uppercase
  if (postcode) {
    const outwardPostcode = postcode.trim().split(' ')[0]
    if (outwardPostcode) {
      parts.push(outwardPostcode.toUpperCase())
    }
  }

  return parts.join(', ')
}
