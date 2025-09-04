export interface Property {
  id: string
  title: string
  price: number
  deposit: number
  address: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  propertyType: "Studio" | "1BR" | "2BR" | "3BR+" | "House"
  description: string
  amenities: string[]
  images: string[]
  availableDate: string
  landlordId: string
  landlordName: string
  landlordPhone: string
  landlordEmail: string
  featured: boolean
}

export interface Landlord {
  id: string
  name: string
  email: string
  phone: string
  properties: string[]
  totalRevenue: number
  activeListings: number
  pendingApplications: number
}

export const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Kensington High Street, Kensington, W8",
    price: 2800,
    deposit: 2800,
    address: "45 Kensington High Street, W8 5ED",
    city: "London",
    state: "Greater London",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Stunning modern flat in the heart of Kensington with excellent transport links, period features, and contemporary kitchen with integrated appliances.",
    amenities: ["Gym", "Parking", "Pet-friendly", "Balcony", "Washing machine"],
    images: ["/modern-downtown-loft.png", "/modern-loft-kitchen.png", "/loft-bedroom-city-view.png"],
    availableDate: "2024-02-01",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "2",
    title: "Brick Lane, Shoreditch, E1",
    price: 1650,
    deposit: 1650,
    address: "78 Brick Lane, E1 6RL",
    city: "London",
    state: "Greater London",
    bedrooms: 0,
    bathrooms: 1,
    propertyType: "Studio",
    description:
      "Charming studio flat perfect for young professionals in trendy Shoreditch. Features high ceilings, large sash windows, and modern kitchenette.",
    amenities: ["Gym", "Roof terrace", "Concierge service"],
    images: ["/cozy-studio-apartment.png", "/studio-kitchenette.png", "/studio-bathroom.png"],
    availableDate: "2024-01-15",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "3",
    title: "Maple Grove, Didsbury, M20",
    price: 3500,
    deposit: 3500,
    address: "12 Maple Grove, M20 2RN",
    city: "Manchester",
    state: "Greater Manchester",
    bedrooms: 4,
    bathrooms: 3,
    propertyType: "House",
    description:
      "Beautiful Victorian family home with large rear garden, period features, and modern kitchen extension. Located in a quiet residential area with excellent schools nearby.",
    amenities: ["Parking", "Pet-friendly", "Garden", "Garage", "Dishwasher"],
    images: ["/spacious-family-home.png", "/cozy-family-living-room.png", "/family-home-kitchen.png"],
    availableDate: "2024-03-01",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "4",
    title: "Canada Square, Canary Wharf, E14",
    price: 4200,
    deposit: 4200,
    address: "25 Canada Square, E14 5LQ",
    city: "London",
    state: "Greater London",
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "3BR+",
    description:
      "Exceptional high-rise apartment with panoramic Thames and city views. Features floor-to-ceiling windows, premium finishes, and access to exclusive building facilities.",
    amenities: ["Gym", "Swimming pool", "Concierge", "Parking", "Balcony"],
    images: ["/luxury-high-rise-living-room.png", "/luxury-apartment-bedroom.png", "/high-rise-balcony-view.png"],
    availableDate: "2024-02-15",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: false,
  },
  {
    id: "5",
    title: "High Street, Chipping Campden, GL54",
    price: 1850,
    deposit: 1850,
    address: "Rose Cottage, High Street, GL54 1AB",
    city: "Chipping Campden",
    state: "Gloucestershire",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Delightful honey-stone cottage in the heart of the Cotswolds with private garden. Features original beams, inglenook fireplace, and modern amenities.",
    amenities: ["Pet-friendly", "Garden", "Parking", "Washing machine"],
    images: ["/charming-cottage-apartment.png", "/cozy-cottage-bedroom.png", "/cottage-garden.png"],
    availableDate: "2024-01-30",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: false,
  },
  {
    id: "6",
    title: "Broad Street, Birmingham City Centre, B1",
    price: 1950,
    deposit: 1950,
    address: "88 Broad Street, B1 2HP",
    city: "Birmingham",
    state: "West Midlands",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Contemporary city centre flat with open-plan living, integrated appliances, and washer/dryer. Walking distance to New Street Station and shopping districts.",
    amenities: ["Gym", "Parking", "Washing machine", "Balcony", "Storage"],
    images: ["/modern-condo-living-room.png", "/modern-condo-kitchen.png", "/cozy-condo-bedroom.png"],
    availableDate: "2024-02-20",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
]

export const sampleLandlords: Landlord[] = [
  {
    id: "landlord1",
    name: "James Thompson",
    email: "james@aceproperties.co.uk",
    phone: "020 7123 4567",
    properties: ["1", "3"],
    totalRevenue: 6300,
    activeListings: 2,
    pendingApplications: 5,
  },
  {
    id: "landlord2",
    name: "Emma Williams",
    email: "emma@aceproperties.co.uk",
    phone: "020 7234 5678",
    properties: ["2", "5"],
    totalRevenue: 3500,
    activeListings: 2,
    pendingApplications: 3,
  },
  {
    id: "landlord3",
    name: "Oliver Davies",
    email: "oliver@aceproperties.co.uk",
    phone: "020 7345 6789",
    properties: ["4", "6"],
    totalRevenue: 6150,
    activeListings: 2,
    pendingApplications: 7,
  },
]
