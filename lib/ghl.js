export async function sendPropertyToGHL(landlordData, propertyData) {
  try {
    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: landlordData.firstName,
        lastName: landlordData.lastName,
        email: landlordData.email,
        phone: landlordData.phone || '',
        tags: ['landlord', 'property-listed'],
        customFields: {
          property_title: propertyData.title,
          property_address: propertyData.address,
          property_price: propertyData.price,
          property_type: propertyData.type
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ GHL sync failed:', response.status, errorText)
      return { success: false }
    }

    const data = await response.json()
    console.log('✅ Sent to GHL:', data)
    return { success: true }
  } catch (error) {
    console.error('❌ GHL sync failed:', error)
    return { success: false }
  }
}
