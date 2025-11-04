/**
 * Shared utility function to format property titles consistently across all APIs
 */
export const formatPropertyTitle = (property: any) => {
  const address = property.address || ''
  const city = property.city || ''
  const postcode = property.postcode || ''
  
  // Extract road name (everything before the first comma or the whole address if no comma)
  // Remove door number from the beginning of the address
  const addressPart = address.split(',')[0].trim()
  const roadName = addressPart.replace(/^\d+\s*/, '').trim()
  
  // Extract outward postcode (first part before space) and capitalize
  const outwardPostcode = postcode ? postcode.split(' ')[0].toUpperCase() : ''
  
  // Format: "Road Name, Area, Outward Postcode" (skip postcode if not available)
  const titleParts = [roadName, city, outwardPostcode].filter(part => part.trim() !== '')
  const title = titleParts.join(', ')
  
  // Capitalize first letter of each word, but keep postcode all caps
  return title.split(' ').map(word => {
    // Keep outward postcode in all caps
    if (outwardPostcode && word === outwardPostcode) {
      return word.toUpperCase()
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')
}

/**
 * Shared utility function to format property data consistently for PropertyCard component
 */
export const formatPropertyForCard = (property: any) => {
  return {
    ...property,
    title: formatPropertyTitle(property),
    price: property.monthly_rent / 100, // Convert from pence to pounds
    availability: property.availability || 'vacant',
    propertyType: property.bedrooms === 0 ? 'Studio' : 
                 property.bedrooms === 1 ? '1BR' :
                 property.bedrooms === 2 ? '2BR' : '3BR+',
    images: property.photos || [],
    amenities: property.amenities || [],
    availableDate: property.available_date,
    property_licence: property.property_licence || 'none',
    property_condition: property.property_condition || 'good'
  }
}