/**
 * UK Location Data
 * Hierarchical structure: Main Region → Sub-Region → Local Authority/Areas
 * Based on standard UK geographic classifications
 */

export interface UKRegion {
  name: string
  cities: string[]
}

export interface Location {
  id: string
  region: string
  city: string
  localAuthorities: string[]
}

// Main UK Regions (6 options) organized geographically
export const ukRegions: Record<string, string[]> = {
  "London": [
    "Central London",
    "North London",
    "North West London",
    "East London",
    "South East London",
    "South West London",
    "West London"
  ],
  "North West": [
    "Greater Manchester",
    "Merseyside",
    "Cheshire",
    "Lancashire",
    "Cumbria"
  ],
  "North East & Yorkshire": [
    "Tyne & Wear",
    "County Durham & Tees Valley",
    "Northumberland",
    "West Yorkshire",
    "South Yorkshire",
    "North & East Yorkshire"
  ],
  "Midlands": [
    "West Midlands (Metropolitan)",
    "Staffordshire & Shropshire",
    "Warwickshire & Coventry",
    "East Midlands - Leicester, Nottingham & Derby Areas",
    "East Midlands - Lincolnshire & Northamptonshire"
  ],
  "South East": [
    "Berkshire & Thames Valley",
    "Kent & Medway",
    "Surrey",
    "Sussex (East & West)",
    "Hampshire & Isle of Wight",
    "Oxfordshire",
    "Buckinghamshire & Milton Keynes"
  ],
  "South West & East of England": [
    "Bristol & Somerset",
    "Devon & Cornwall",
    "Dorset & Wiltshire",
    "Gloucestershire",
    "Cambridgeshire & Peterborough",
    "Norfolk & Suffolk",
    "Essex & Hertfordshire",
    "Bedfordshire & Luton",
    "Isles of Scilly"
  ]
}

// Local Authorities (specific areas) for each sub-region - Complete list of 317 authorities
export const localAuthorities: Record<string, string[]> = {
  // ========== LONDON (33 authorities) ==========
  "Central London": [
    "Camden",
    "City of London",
    "Islington",
    "Westminster"
  ],
  "North London": [
    "Barnet",
    "Enfield",
    "Haringey"
  ],
  "North West London": [
    "Brent",
    "Harrow"
  ],
  "East London": [
    "Barking and Dagenham",
    "Hackney",
    "Havering",
    "Newham",
    "Redbridge",
    "Tower Hamlets",
    "Waltham Forest"
  ],
  "South East London": [
    "Bexley",
    "Bromley",
    "Greenwich",
    "Lewisham"
  ],
  "South West London": [
    "Croydon",
    "Kingston upon Thames",
    "Lambeth",
    "Merton",
    "Richmond upon Thames",
    "Southwark",
    "Sutton",
    "Wandsworth"
  ],
  "West London": [
    "Ealing",
    "Hammersmith and Fulham",
    "Hillingdon",
    "Hounslow",
    "Kensington and Chelsea"
  ],

  // ========== NORTH WEST (49 authorities) ==========
  "Greater Manchester": [
    "Bolton",
    "Bury",
    "Manchester",
    "Oldham",
    "Rochdale",
    "Salford",
    "Stockport",
    "Tameside",
    "Trafford",
    "Wigan"
  ],
  "Merseyside": [
    "Knowsley",
    "Liverpool",
    "Sefton",
    "St Helens",
    "Wirral"
  ],
  "Cheshire": [
    "Cheshire East",
    "Cheshire West and Chester",
    "Halton",
    "Warrington"
  ],
  "Lancashire": [
    "Blackburn with Darwen",
    "Blackpool",
    "Burnley",
    "Chorley",
    "Fylde",
    "Hyndburn",
    "Lancaster",
    "Lancashire County Council",
    "Pendle",
    "Preston",
    "Ribble Valley",
    "Rossendale",
    "South Ribble",
    "West Lancashire",
    "Wyre"
  ],
  "Cumbria": [
    "Cumberland",
    "Westmorland and Furness"
  ],

  // ========== NORTH EAST & YORKSHIRE (27 authorities) ==========
  "Tyne & Wear": [
    "Gateshead",
    "Newcastle upon Tyne",
    "North Tyneside",
    "South Tyneside",
    "Sunderland"
  ],
  "County Durham & Tees Valley": [
    "Darlington",
    "Durham",
    "Hartlepool",
    "Middlesbrough",
    "Redcar and Cleveland",
    "Stockton-on-Tees"
  ],
  "Northumberland": [
    "Northumberland"
  ],
  "West Yorkshire": [
    "Bradford",
    "Calderdale",
    "Kirklees",
    "Leeds",
    "Wakefield"
  ],
  "South Yorkshire": [
    "Barnsley",
    "Doncaster",
    "Rotherham",
    "Sheffield"
  ],
  "North & East Yorkshire": [
    "East Riding of Yorkshire",
    "Hull (Kingston upon Hull)",
    "North Yorkshire",
    "York"
  ],

  // ========== MIDLANDS (57 authorities) ==========
  "West Midlands (Metropolitan)": [
    "Birmingham",
    "Coventry",
    "Dudley",
    "Sandwell",
    "Solihull",
    "Walsall",
    "Wolverhampton"
  ],
  "Staffordshire & Shropshire": [
    "Bromsgrove",
    "Cannock Chase",
    "East Staffordshire",
    "Herefordshire",
    "Lichfield",
    "Malvern Hills",
    "Newcastle-under-Lyme",
    "Redditch",
    "Shropshire",
    "South Staffordshire",
    "Stafford",
    "Staffordshire County Council",
    "Staffordshire Moorlands",
    "Stoke-on-Trent",
    "Tamworth",
    "Telford and Wrekin",
    "Worcester",
    "Worcestershire County Council",
    "Wychavon",
    "Wyre Forest"
  ],
  "Warwickshire & Coventry": [
    "North Warwickshire",
    "Nuneaton and Bedworth",
    "Rugby",
    "Stratford-on-Avon",
    "Warwick",
    "Warwickshire County Council"
  ],
  "East Midlands - Leicester, Nottingham & Derby Areas": [
    "Amber Valley",
    "Ashfield",
    "Bassetlaw",
    "Blaby",
    "Bolsover",
    "Broxtowe",
    "Charnwood",
    "Chesterfield",
    "Derby",
    "Derbyshire County Council",
    "Derbyshire Dales",
    "Erewash",
    "Gedling",
    "Harborough",
    "High Peak",
    "Hinckley and Bosworth",
    "Leicester",
    "Leicestershire County Council",
    "Mansfield",
    "Melton",
    "Newark and Sherwood",
    "North East Derbyshire",
    "North West Leicestershire",
    "Nottingham",
    "Nottinghamshire County Council",
    "Oadby and Wigston",
    "Rushcliffe",
    "South Derbyshire"
  ],
  "East Midlands - Lincolnshire & Northamptonshire": [
    "Boston",
    "East Lindsey",
    "Lincoln",
    "Lincolnshire County Council",
    "North East Lincolnshire",
    "North Kesteven",
    "North Lincolnshire",
    "North Northamptonshire",
    "Rutland",
    "South Holland",
    "South Kesteven",
    "West Lindsey",
    "West Northamptonshire"
  ],

  // ========== SOUTH EAST (75 authorities) ==========
  "Berkshire & Thames Valley": [
    "Bracknell Forest",
    "Reading",
    "Slough",
    "West Berkshire",
    "Windsor and Maidenhead",
    "Wokingham"
  ],
  "Kent & Medway": [
    "Ashford",
    "Canterbury",
    "Dartford",
    "Dover",
    "Folkestone and Hythe",
    "Gravesham",
    "Kent County Council",
    "Maidstone",
    "Medway",
    "Sevenoaks",
    "Swale",
    "Thanet",
    "Tonbridge and Malling",
    "Tunbridge Wells"
  ],
  "Surrey": [
    "Elmbridge",
    "Epsom and Ewell",
    "Guildford",
    "Mole Valley",
    "Reigate and Banstead",
    "Runnymede",
    "Spelthorne",
    "Surrey County Council",
    "Surrey Heath",
    "Tandridge",
    "Waverley",
    "Woking"
  ],
  "Sussex (East & West)": [
    "Adur",
    "Arun",
    "Brighton and Hove",
    "Chichester",
    "Crawley",
    "East Sussex County Council",
    "Eastbourne",
    "Hastings",
    "Horsham",
    "Lewes",
    "Mid Sussex",
    "Rother",
    "Wealden",
    "West Sussex County Council",
    "Worthing"
  ],
  "Hampshire & Isle of Wight": [
    "Basingstoke and Deane",
    "East Hampshire",
    "Eastleigh",
    "Fareham",
    "Gosport",
    "Hampshire County Council",
    "Hart",
    "Havant",
    "Isle of Wight",
    "New Forest",
    "Portsmouth",
    "Rushmoor",
    "Southampton",
    "Test Valley",
    "Winchester"
  ],
  "Oxfordshire": [
    "Cherwell",
    "Oxford",
    "Oxfordshire County Council",
    "South Oxfordshire",
    "Vale of White Horse",
    "West Oxfordshire"
  ],
  "Buckinghamshire & Milton Keynes": [
    "Buckinghamshire",
    "Milton Keynes"
  ],

  // ========== SOUTH WEST & EAST OF ENGLAND (76 authorities) ==========
  "Bristol & Somerset": [
    "Bath and North East Somerset",
    "Bristol",
    "North Somerset",
    "Somerset",
    "South Gloucestershire"
  ],
  "Devon & Cornwall": [
    "Cornwall",
    "Devon County Council",
    "East Devon",
    "Exeter",
    "Mid Devon",
    "North Devon",
    "Plymouth",
    "South Hams",
    "Teignbridge",
    "Torbay",
    "Torridge",
    "West Devon"
  ],
  "Dorset & Wiltshire": [
    "Bournemouth, Christchurch and Poole",
    "Dorset",
    "Swindon",
    "Wiltshire"
  ],
  "Gloucestershire": [
    "Cheltenham",
    "Cotswold",
    "Forest of Dean",
    "Gloucester",
    "Gloucestershire County Council",
    "Stroud",
    "Tewkesbury"
  ],
  "Cambridgeshire & Peterborough": [
    "Cambridge",
    "Cambridgeshire County Council",
    "East Cambridgeshire",
    "Fenland",
    "Huntingdonshire",
    "Peterborough",
    "South Cambridgeshire"
  ],
  "Norfolk & Suffolk": [
    "Babergh",
    "Breckland",
    "Broadland",
    "East Suffolk",
    "Great Yarmouth",
    "Ipswich",
    "King's Lynn and West Norfolk",
    "Mid Suffolk",
    "Norfolk County Council",
    "North Norfolk",
    "Norwich",
    "South Norfolk",
    "Suffolk County Council",
    "West Suffolk"
  ],
  "Essex & Hertfordshire": [
    "Basildon",
    "Braintree",
    "Brentwood",
    "Broxbourne",
    "Castle Point",
    "Chelmsford",
    "Colchester",
    "Dacorum",
    "East Hertfordshire",
    "Epping Forest",
    "Essex County Council",
    "Harlow",
    "Hertfordshire County Council",
    "Hertsmere",
    "Maldon",
    "North Hertfordshire",
    "Rochford",
    "Southend-on-Sea",
    "St Albans",
    "Stevenage",
    "Tendring",
    "Three Rivers",
    "Thurrock",
    "Uttlesford",
    "Watford",
    "Welwyn Hatfield"
  ],
  "Bedfordshire & Luton": [
    "Bedford",
    "Central Bedfordshire",
    "Luton"
  ],
  "Isles of Scilly": [
    "Isles of Scilly"
  ]
}

/**
 * Get cities for a given region
 */
export function getCitiesForRegion(region: string): string[] {
  return ukRegions[region] || []
}

/**
 * Get local authorities for a given city
 */
export function getLocalAuthoritiesForCity(city: string): string[] {
  return localAuthorities[city] || []
}

/**
 * Get region for a given city
 */
export function getRegionForCity(city: string): string | null {
  for (const [region, cities] of Object.entries(ukRegions)) {
    if (cities.includes(city)) {
      return region
    }
  }
  return null
}

/**
 * Get all regions with London first (most searched), then geographic order
 */
export function getAllRegions(): string[] {
  // London first as it's the most searched, then geographic order (North to South)
  return [
    "London",
    "North East & Yorkshire",
    "North West",
    "Midlands",
    "South West & East of England",
    "South East"
  ]
}
