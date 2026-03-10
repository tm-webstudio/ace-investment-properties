import { formatPropertyTitleFromProperty } from './format-address'

/**
 * Re-export for backwards compatibility — callers that import formatPropertyTitle
 * from property-utils will now use the canonical implementation in format-address.ts
 */
export const formatPropertyTitle = formatPropertyTitleFromProperty

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
