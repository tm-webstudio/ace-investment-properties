import { NextRequest, NextResponse } from 'next/server'

const districtToCityMap: Record<string, string> = {
  'barking and dagenham': 'London', 'barnet': 'London', 'bexley': 'London',
  'brent': 'London', 'bromley': 'London', 'camden': 'London', 'croydon': 'London',
  'ealing': 'London', 'enfield': 'London', 'greenwich': 'London', 'hackney': 'London',
  'hammersmith and fulham': 'London', 'haringey': 'London', 'harrow': 'London',
  'havering': 'London', 'hillingdon': 'London', 'hounslow': 'London',
  'islington': 'London', 'kensington and chelsea': 'London',
  'kingston upon thames': 'London', 'lambeth': 'London', 'lewisham': 'London',
  'merton': 'London', 'newham': 'London', 'redbridge': 'London',
  'richmond upon thames': 'London', 'southwark': 'London', 'sutton': 'London',
  'tower hamlets': 'London', 'waltham forest': 'London', 'wandsworth': 'London',
  'westminster': 'London', 'city of london': 'London',
  'manchester': 'Manchester', 'salford': 'Manchester', 'bolton': 'Manchester',
  'bury': 'Manchester', 'oldham': 'Manchester', 'rochdale': 'Manchester',
  'stockport': 'Manchester', 'tameside': 'Manchester', 'trafford': 'Manchester',
  'wigan': 'Manchester',
  'birmingham': 'Birmingham', 'coventry': 'Coventry', 'dudley': 'Birmingham',
  'sandwell': 'Birmingham', 'solihull': 'Birmingham', 'walsall': 'Birmingham',
  'wolverhampton': 'Birmingham',
  'liverpool': 'Liverpool', 'sefton': 'Liverpool', 'knowsley': 'Liverpool',
  'st helens': 'Liverpool', 'wirral': 'Liverpool',
  'leeds': 'Leeds', 'bradford': 'Leeds', 'calderdale': 'Leeds',
  'kirklees': 'Leeds', 'wakefield': 'Leeds',
  'newcastle upon tyne': 'Newcastle', 'gateshead': 'Newcastle',
  'north tyneside': 'Newcastle', 'south tyneside': 'Newcastle', 'sunderland': 'Newcastle',
  'brighton and hove': 'Brighton',
  'bristol, city of': 'Bristol', 'bristol': 'Bristol',
  'nottingham': 'Nottingham', 'leicester': 'Leicester',
}

function deriveCityFromDistrict(adminDistrict: string): string {
  return districtToCityMap[adminDistrict.toLowerCase()] ?? adminDistrict
}

function buildTitle(street: string, city: string, postcode: string): string {
  const parts: string[] = []
  if (street) parts.push(street)
  if (city) parts.push(city)
  if (postcode) parts.push(postcode.split(' ')[0].toUpperCase())
  return parts.join(', ')
}

function buildAddress(street: string, city: string, postcode: string): string {
  const parts: string[] = []
  if (street) parts.push(street)
  if (city) parts.push(city)
  if (postcode) parts.push(postcode.toUpperCase())
  return parts.join(', ')
}

async function getStreetFromPostcode(postcode: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return ''
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${apiKey}`
    )
    if (!res.ok) return ''
    const data = await res.json()
    const components: { types: string[]; long_name: string }[] = data.results?.[0]?.address_components ?? []
    return components.find(c => c.types.includes('route'))?.long_name ?? ''
  } catch {
    return ''
  }
}

const EMPTY = { city: '', local_authority: '', postcode_clean: '', title: '', address: '' }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.postcode) {
    return NextResponse.json({ error: 'postcode is required', ...EMPTY }, { status: 400 })
  }

  const postcode_clean = (body.postcode as string).replace(/\s+/g, '').toUpperCase()

  const [pcRes, street] = await Promise.all([
    fetch(`https://api.postcodes.io/postcodes/${postcode_clean}`),
    getStreetFromPostcode(postcode_clean),
  ])

  if (!pcRes.ok) {
    const status = pcRes.status === 404 ? 400 : 500
    return NextResponse.json(
      { error: 'Postcode not found or invalid', ...EMPTY, postcode_clean },
      { status }
    )
  }

  const json = await pcRes.json()
  const result = json.result
  const adminDistrict: string = result.admin_district ?? ''
  const city = adminDistrict ? deriveCityFromDistrict(adminDistrict) : ''
  const formattedPostcode: string = result.postcode ?? postcode_clean
  const title = buildTitle(street, city, formattedPostcode)
  const address = buildAddress(street, city, formattedPostcode)

  return NextResponse.json({
    city,
    local_authority: adminDistrict,
    postcode_clean: formattedPostcode,
    title,
    address,
  })
}
