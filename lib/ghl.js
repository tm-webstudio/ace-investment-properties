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
        tags: ['landlord', 'property-listed', 'aip-website'],
        customField: {
          property_title: propertyData.title,
          property_address: propertyData.address,
          property_type: propertyData.type,
          property_bedrooms: propertyData.bedrooms,
          property_bathrooms: propertyData.bathrooms,
          property_monthly_rent: propertyData.monthlyRent,
          property_available_date: propertyData.availableDate,
          property_city: propertyData.city,
          property_postcode: propertyData.postcode,
          property_local_authority: propertyData.localAuthority,
          property_condition: propertyData.condition,
          property_licence: propertyData.licence,
          property_contact_phone: propertyData.contactPhone,
          property_contact_email: propertyData.contactEmail
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

export async function sendInvestorSignupToGHL(investorData) {
  try {
    const prefs = investorData.preferences?.preference_data
    const locations = prefs?.locations?.map(l => l.city || l.region).filter(Boolean).join(', ')

    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: investorData.firstName,
        lastName: investorData.lastName,
        email: investorData.email,
        phone: investorData.phone || '',
        companyName: investorData.companyName || '',
        tags: ['investor', 'signed-up', 'aip-website'],
        customField: {
          investor_operator_type: investorData.preferences?.operator_type || '',
          investor_properties_managing: investorData.preferences?.properties_managing ?? '',
          investor_budget_min: prefs?.budget?.min ?? '',
          investor_budget_max: prefs?.budget?.max ?? '',
          investor_budget_type: prefs?.budget?.type || '',
          investor_bedrooms_min: prefs?.bedrooms?.min ?? '',
          investor_bedrooms_max: prefs?.bedrooms?.max ?? '',
          investor_property_types: prefs?.property_types?.join(', ') || '',
          investor_property_licences: prefs?.property_licenses?.join(', ') || '',
          investor_locations: locations || ''
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ GHL investor signup sync failed:', response.status, errorText)
      return { success: false }
    }

    const data = await response.json()
    console.log('✅ Sent investor signup to GHL:', data)
    return { success: true }
  } catch (error) {
    console.error('❌ GHL investor signup sync failed:', error)
    return { success: false }
  }
}

export async function sendLandlordSignupToGHL(landlordData) {
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
        tags: ['landlord', 'signed-up', 'aip-website']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ GHL landlord signup sync failed:', response.status, errorText)
      return { success: false }
    }

    const data = await response.json()
    console.log('✅ Sent landlord signup to GHL:', data)
    return { success: true }
  } catch (error) {
    console.error('❌ GHL landlord signup sync failed:', error)
    return { success: false }
  }
}
