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

export interface Investor {
  id: string
  name: string
  email: string
  phone: string
  savedProperties: string[]
  scheduledViewings: number
  portfolioValue: number
  monthlyROI: number
  searchCriteria: {
    minPrice: number
    maxPrice: number
    location: string[]
    propertyType: string[]
    minYield: number
  }
}

export interface SavedProperty {
  id: string
  propertyId: string
  investorId: string
  savedDate: string
  notes?: string
}

export interface Viewing {
  id: string
  propertyId: string
  investorId: string
  propertyTitle: string
  viewingDate: string
  viewingTime: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}

export interface Notification {
  id: string
  investorId: string
  type: "new_property" | "price_change" | "viewing_reminder" | "market_update"
  title: string
  message: string
  propertyId?: string
  isRead: boolean
  createdAt: string
}

export interface Admin {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "moderator"
  permissions: string[]
}

export interface PendingProperty {
  id: string
  propertyData: Omit<Property, 'id'>
  submittedBy: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  reviewNotes?: string
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
    availableDate: "2025-12-15",
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
    availableDate: "2024-12-15",
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
    availableDate: "2025-08-15",
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
    availableDate: "2025-10-01",
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
    availableDate: "2024-09-20",
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
    availableDate: "2024-10-15",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "7",
    title: "Portobello Road, Notting Hill, W11",
    price: 3200,
    deposit: 3200,
    address: "142 Portobello Road, W11 2DZ",
    city: "London",
    state: "Greater London",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Charming Victorian conversion on famous Portobello Road with period features and modern kitchen. Walking distance to Notting Hill Gate and Hyde Park.",
    amenities: ["Period features", "Modern kitchen", "Hyde Park nearby", "Transport links"],
    images: ["/charming-cottage-apartment.png", "/cozy-cottage-bedroom.png", "/cottage-garden.png"],
    availableDate: "2025-11-01",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "8",
    title: "Borough High Street, London Bridge, SE1",
    price: 2100,
    deposit: 2100,
    address: "89 Borough High Street, SE1 1NL",
    city: "London",
    state: "Greater London",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Contemporary apartment near Borough Market and London Bridge Station. Features exposed brick walls and industrial-style fittings.",
    amenities: ["Borough Market nearby", "Transport links", "Exposed brick", "Industrial style"],
    images: ["/modern-downtown-loft.png", "/modern-loft-kitchen.png", "/loft-bedroom-city-view.png"],
    availableDate: "2025-12-01",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "9",
    title: "Clapham Common South Side, SW4",
    price: 2600,
    deposit: 2600,
    address: "25 Clapham Common South Side, SW4 9BL",
    city: "London",
    state: "Greater London",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Stylish flat overlooking Clapham Common with original features and modern amenities. Perfect for young professionals with vibrant nightlife nearby.",
    amenities: ["Common views", "Original features", "Nightlife nearby", "Young professional area"],
    images: ["/modern-condo-living-room.png", "/modern-condo-kitchen.png", "/cozy-condo-bedroom.png"],
    availableDate: "2025-10-15",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "10",
    title: "King's Road, Chelsea, SW3",
    price: 4500,
    deposit: 4500,
    address: "167 King's Road, SW3 5TX",
    city: "London",
    state: "Greater London",
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "3BR+",
    description:
      "Luxurious apartment on prestigious King's Road with designer interiors and concierge service. Close to Chelsea boutiques and restaurants.",
    amenities: ["Designer interiors", "Concierge service", "Chelsea location", "Luxury finishes"],
    images: ["/luxury-high-rise-living-room.png", "/luxury-apartment-bedroom.png", "/high-rise-balcony-view.png"],
    availableDate: "2025-11-15",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "11",
    title: "Camden High Street, Camden, NW1",
    price: 1950,
    deposit: 1950,
    address: "78 Camden High Street, NW1 0LT",
    city: "London",
    state: "Greater London",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Vibrant apartment in the heart of Camden with eclectic decor and excellent transport links. Perfect for creative professionals and music lovers.",
    amenities: ["Camden Market nearby", "Music venues", "Creative area", "Transport links"],
    images: ["/cozy-studio-apartment.png", "/studio-kitchenette.png", "/studio-bathroom.png"],
    availableDate: "2025-09-30",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
]

export const kentProperties: Property[] = [
  {
    id: "kent1",
    title: "High Street, Canterbury, CT1",
    price: 1200,
    deposit: 1200,
    address: "23 High Street, CT1 2RX",
    city: "Canterbury",
    state: "Kent",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Charming period apartment in historic Canterbury city centre with original features and modern amenities. Walking distance to cathedral and university.",
    amenities: ["Pet-friendly", "Washing machine", "City centre location"],
    images: ["/charming-cottage-apartment.png", "/cozy-cottage-bedroom.png", "/cottage-garden.png"],
    availableDate: "2025-09-15",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent2",
    title: "Marine Parade, Margate, CT9",
    price: 950,
    deposit: 950,
    address: "15 Marine Parade, CT9 1DH",
    city: "Margate",
    state: "Kent",
    bedrooms: 0,
    bathrooms: 1,
    propertyType: "Studio",
    description:
      "Coastal studio apartment with sea views and direct beach access. Perfect for young professionals seeking seaside living with good transport links to London.",
    amenities: ["Sea view", "Balcony", "Beach access"],
    images: ["/cozy-studio-apartment.png", "/studio-kitchenette.png", "/studio-bathroom.png"],
    availableDate: "2025-09-05",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent3",
    title: "Castle Street, Tonbridge, TN9",
    price: 1650,
    deposit: 1650,
    address: "8 Castle Street, TN9 1BH",
    city: "Tonbridge",
    state: "Kent",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Modern apartment in historic Tonbridge with castle views. Features contemporary kitchen, parking space, and excellent rail connections to London.",
    amenities: ["Parking", "Castle views", "Modern kitchen", "Rail connections"],
    images: ["/modern-condo-living-room.png", "/modern-condo-kitchen.png", "/cozy-condo-bedroom.png"],
    availableDate: "2025-10-01",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent4",
    title: "The Green, Sevenoaks, TN13",
    price: 2200,
    deposit: 2200,
    address: "12 The Green, TN13 1JG",
    city: "Sevenoaks",
    state: "Kent",
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "3BR+",
    description:
      "Elegant Georgian townhouse overlooking Sevenoaks Green with period features and modern conveniences. Perfect for families with excellent schools nearby.",
    amenities: ["Garden", "Parking", "Period features", "Family-friendly"],
    images: ["/spacious-family-home.png", "/cozy-family-living-room.png", "/family-home-kitchen.png"],
    availableDate: "2025-09-20",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent5",
    title: "Royal Tunbridge Wells, TN1",
    price: 1800,
    deposit: 1800,
    address: "34 Mount Pleasant, TN1 1QX",
    city: "Royal Tunbridge Wells",
    state: "Kent",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Elegant Regency apartment in historic spa town with period features and modern conveniences. Close to The Pantiles and excellent shopping.",
    amenities: ["Period features", "Spa town", "Shopping nearby", "Historic location"],
    images: ["/charming-cottage-apartment.png", "/cozy-cottage-bedroom.png", "/cottage-garden.png"],
    availableDate: "2025-10-10",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent6",
    title: "Dock Road, Chatham Maritime, ME4",
    price: 1400,
    deposit: 1400,
    address: "21 Dock Road, ME4 4HU",
    city: "Chatham",
    state: "Kent",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Modern waterfront apartment with marina views and secure parking. Part of prestigious maritime development with excellent transport links.",
    amenities: ["Marina views", "Secure parking", "Waterfront", "Modern development"],
    images: ["/modern-condo-living-room.png", "/modern-condo-kitchen.png", "/cozy-condo-bedroom.png"],
    availableDate: "2025-11-05",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent7",
    title: "Dover Road, Folkestone, CT20",
    price: 1100,
    deposit: 1100,
    address: "67 Dover Road, CT20 1SE",
    city: "Folkestone",
    state: "Kent",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Cozy apartment near Folkestone seafront with channel views. Perfect for those seeking coastal living with good transport links to London.",
    amenities: ["Channel views", "Seafront nearby", "Coastal living", "Transport links"],
    images: ["/cozy-studio-apartment.png", "/studio-kitchenette.png", "/studio-bathroom.png"],
    availableDate: "2025-09-20",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "kent8",
    title: "Week Street, Maidstone, ME14",
    price: 1500,
    deposit: 1500,
    address: "45 Week Street, ME14 1QS",
    city: "Maidstone",
    state: "Kent",
    bedrooms: 2,
    bathrooms: 1,
    propertyType: "2BR",
    description:
      "Central apartment in county town with shopping and dining on your doorstep. Excellent rail connections to London and modern amenities.",
    amenities: ["County town", "Shopping nearby", "Dining options", "Rail connections"],
    images: ["/modern-downtown-loft.png", "/modern-loft-kitchen.png", "/loft-bedroom-city-view.png"],
    availableDate: "2025-10-25",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
]

export const midlandsProperties: Property[] = [
  {
    id: "midlands1",
    title: "New Street, Birmingham, B2",
    price: 1400,
    deposit: 1400,
    address: "56 New Street, B2 4DU",
    city: "Birmingham",
    state: "West Midlands",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Modern city centre apartment with excellent transport links and shopping on your doorstep. Perfect for professionals working in Birmingham's business district.",
    amenities: ["City centre", "Transport links", "Shopping nearby", "Modern fixtures"],
    images: ["/modern-downtown-loft.png", "/modern-loft-kitchen.png", "/loft-bedroom-city-view.png"],
    availableDate: "2025-09-10",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands2",
    title: "Castle Street, Nottingham, NG1",
    price: 1100,
    deposit: 1100,
    address: "28 Castle Street, NG1 6AF",
    city: "Nottingham",
    state: "Nottinghamshire",
    bedrooms: 0,
    bathrooms: 1,
    propertyType: "Studio",
    description:
      "Stylish studio apartment in Nottingham's historic city centre. Walking distance to universities, shops, and nightlife with excellent value for money.",
    amenities: ["Historic location", "University nearby", "City centre", "Great value"],
    images: ["/cozy-studio-apartment.png", "/studio-kitchenette.png", "/studio-bathroom.png"],
    availableDate: "2025-09-25",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands3",
    title: "High Street, Leicester, LE1",
    price: 1300,
    deposit: 1300,
    address: "42 High Street, LE1 5YR",
    city: "Leicester",
    state: "Leicestershire",
    bedrooms: 2,
    bathrooms: 1,
    propertyType: "2BR",
    description:
      "Spacious two-bedroom flat in Leicester city centre with modern amenities and good transport connections. Ideal for sharers or small families.",
    amenities: ["Spacious", "Modern amenities", "Transport links", "City centre"],
    images: ["/modern-condo-living-room.png", "/modern-condo-kitchen.png", "/cozy-condo-bedroom.png"],
    availableDate: "2025-10-15",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands4",
    title: "Victoria Road, Coventry, CV1",
    price: 1600,
    deposit: 1600,
    address: "15 Victoria Road, CV1 3JX",
    city: "Coventry",
    state: "West Midlands",
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "3BR+",
    description:
      "Family-friendly house near Coventry University with garden space and parking. Perfect for students or young families seeking affordable city living.",
    amenities: ["Garden", "Parking", "University nearby", "Family-friendly"],
    images: ["/spacious-family-home.png", "/cozy-family-living-room.png", "/family-home-kitchen.png"],
    availableDate: "2025-09-30",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands5",
    title: "Corporation Street, Birmingham, B4",
    price: 1600,
    deposit: 1600,
    address: "92 Corporation Street, B4 6SX",
    city: "Birmingham",
    state: "West Midlands",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Premium apartment in Birmingham's business district with floor-to-ceiling windows and modern amenities. Walking distance to major shopping centers.",
    amenities: ["Business district", "Floor-to-ceiling windows", "Premium location", "Shopping nearby"],
    images: ["/luxury-high-rise-living-room.png", "/luxury-apartment-bedroom.png", "/high-rise-balcony-view.png"],
    availableDate: "2025-10-05",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands6",
    title: "Market Square, Nottingham, NG1",
    price: 1250,
    deposit: 1250,
    address: "16 Market Square, NG1 2DP",
    city: "Nottingham",
    state: "Nottinghamshire",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Historic apartment overlooking Nottingham's famous Market Square with period features and modern conveniences. Perfect city centre location.",
    amenities: ["Market Square views", "Historic location", "Period features", "City centre"],
    images: ["/charming-cottage-apartment.png", "/cozy-cottage-bedroom.png", "/cottage-garden.png"],
    availableDate: "2025-11-10",
    landlordId: "landlord1",
    landlordName: "James Thompson",
    landlordPhone: "020 7123 4567",
    landlordEmail: "james@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands7",
    title: "Charles Street, Leicester, LE1",
    price: 1150,
    deposit: 1150,
    address: "78 Charles Street, LE1 1FB",
    city: "Leicester",
    state: "Leicestershire",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "1BR",
    description:
      "Modern apartment in Leicester's cultural quarter with contemporary design and excellent amenities. Close to universities and entertainment venues.",
    amenities: ["Cultural quarter", "Contemporary design", "University nearby", "Entertainment venues"],
    images: ["/modern-downtown-loft.png", "/modern-loft-kitchen.png", "/loft-bedroom-city-view.png"],
    availableDate: "2025-09-15",
    landlordId: "landlord2",
    landlordName: "Emma Williams",
    landlordPhone: "020 7234 5678",
    landlordEmail: "emma@aceproperties.co.uk",
    featured: true,
  },
  {
    id: "midlands8",
    title: "Warwick Road, Coventry, CV3",
    price: 1450,
    deposit: 1450,
    address: "34 Warwick Road, CV3 6AU",
    city: "Coventry",
    state: "West Midlands",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "2BR",
    description:
      "Spacious apartment near Coventry University with modern kitchen and private balcony. Perfect for students or young professionals.",
    amenities: ["University nearby", "Modern kitchen", "Private balcony", "Spacious"],
    images: ["/spacious-family-home.png", "/cozy-family-living-room.png", "/family-home-kitchen.png"],
    availableDate: "2025-10-20",
    landlordId: "landlord3",
    landlordName: "Oliver Davies",
    landlordPhone: "020 7345 6789",
    landlordEmail: "oliver@aceproperties.co.uk",
    featured: true,
  },
]

export const sampleInvestors: Investor[] = [
  {
    id: "investor1",
    name: "Alexandra Morgan",
    email: "alexandra@investments.co.uk",
    phone: "020 7987 6543",
    savedProperties: ["1", "4", "7", "kent1", "midlands1"],
    scheduledViewings: 3,
    portfolioValue: 1250000,
    monthlyROI: 8.5,
    searchCriteria: {
      minPrice: 1500,
      maxPrice: 4000,
      location: ["London", "Kent"],
      propertyType: ["2BR", "3BR+"],
      minYield: 6.0
    }
  },
  {
    id: "investor2",
    name: "Robert Chen",
    email: "robert@propertyinvest.co.uk",
    phone: "020 7876 5432",
    savedProperties: ["2", "6", "8", "kent2", "midlands3"],
    scheduledViewings: 2,
    portfolioValue: 850000,
    monthlyROI: 7.2,
    searchCriteria: {
      minPrice: 1000,
      maxPrice: 2500,
      location: ["Birmingham", "Manchester", "Kent"],
      propertyType: ["Studio", "1BR", "2BR"],
      minYield: 7.5
    }
  }
]

export const sampleSavedProperties: SavedProperty[] = [
  {
    id: "saved1",
    propertyId: "1",
    investorId: "investor1",
    savedDate: "2025-09-10",
    notes: "Great location, good yield potential"
  },
  {
    id: "saved2",
    propertyId: "4",
    investorId: "investor1",
    savedDate: "2025-09-09",
    notes: "Premium location, check rental demand"
  },
  {
    id: "saved3",
    propertyId: "7",
    investorId: "investor1",
    savedDate: "2025-09-08"
  },
  {
    id: "saved4",
    propertyId: "2",
    investorId: "investor2",
    savedDate: "2025-09-07",
    notes: "Good starter investment"
  }
]

export const sampleViewings: Viewing[] = [
  {
    id: "viewing1",
    propertyId: "1",
    investorId: "investor1",
    propertyTitle: "Kensington High Street, Kensington, W8",
    viewingDate: "2025-09-15",
    viewingTime: "14:00",
    status: "scheduled"
  },
  {
    id: "viewing2",
    propertyId: "4",
    investorId: "investor1",
    propertyTitle: "Canada Square, Canary Wharf, E14",
    viewingDate: "2025-09-16",
    viewingTime: "10:30",
    status: "scheduled"
  },
  {
    id: "viewing3",
    propertyId: "kent1",
    investorId: "investor1",
    propertyTitle: "High Street, Canterbury, CT1",
    viewingDate: "2025-09-18",
    viewingTime: "15:00",
    status: "scheduled"
  },
  {
    id: "viewing4",
    propertyId: "2",
    investorId: "investor2",
    propertyTitle: "Brick Lane, Shoreditch, E1",
    viewingDate: "2025-09-14",
    viewingTime: "11:00",
    status: "completed",
    notes: "Good condition, tenant currently in place"
  }
]

export const sampleNotifications: Notification[] = [
  {
    id: "notif1",
    investorId: "investor1",
    type: "new_property",
    title: "New Property Match",
    message: "A new 2BR property in Kensington matching your criteria is now available.",
    propertyId: "7",
    isRead: false,
    createdAt: "2025-09-11T09:00:00Z"
  },
  {
    id: "notif2",
    investorId: "investor1",
    type: "viewing_reminder",
    title: "Viewing Reminder",
    message: "Your property viewing at Kensington High Street is scheduled for tomorrow at 2:00 PM.",
    propertyId: "1",
    isRead: false,
    createdAt: "2025-09-11T08:30:00Z"
  },
  {
    id: "notif3",
    investorId: "investor1",
    type: "price_change",
    title: "Price Reduction",
    message: "The price for Canada Square property has been reduced by £200/month.",
    propertyId: "4",
    isRead: true,
    createdAt: "2025-09-10T16:45:00Z"
  },
  {
    id: "notif4",
    investorId: "investor1",
    type: "market_update",
    title: "Market Update",
    message: "Rental yields in Kensington have increased by 0.3% this quarter.",
    isRead: true,
    createdAt: "2025-09-09T12:00:00Z"
  }
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

export const sampleAdmins: Admin[] = [
  {
    id: "admin1",
    name: "Sarah Mitchell",
    email: "sarah.admin@aceproperties.co.uk",
    role: "super_admin",
    permissions: ["manage_properties", "manage_users", "view_analytics", "manage_viewings", "system_settings"]
  },
  {
    id: "admin2",
    name: "James Thompson",
    email: "james.admin@aceproperties.co.uk",
    role: "admin",
    permissions: ["manage_properties", "manage_viewings", "view_analytics"]
  }
]

export const samplePendingProperties: PendingProperty[] = [
  {
    id: "pending1",
    propertyData: {
      title: "Modern Studio Apartment in Canary Wharf",
      price: 1850,
      deposit: 1850,
      address: "25 Discovery Dock East, E14 9YZ",
      city: "London",
      state: "Greater London",
      bedrooms: 1,
      bathrooms: 1,
      propertyType: "Studio",
      description: "Contemporary studio with floor-to-ceiling windows and stunning river views.",
      amenities: ["Gym", "Concierge", "Balcony"],
      images: ["/pending-studio.png"],
      availableDate: "2025-10-01",
      landlordId: "landlord1",
      landlordName: "John Smith",
      landlordPhone: "020 7123 4567",
      landlordEmail: "john@aceproperties.co.uk",
      featured: false
    },
    submittedBy: "landlord1",
    submittedDate: "2025-09-10",
    status: "pending"
  },
  {
    id: "pending2",
    propertyData: {
      title: "Victorian Terrace in Clapham",
      price: 3200,
      deposit: 3200,
      address: "12 Clapham Common South Side, SW4 7AB",
      city: "London",
      state: "Greater London",
      bedrooms: 3,
      bathrooms: 2,
      propertyType: "3BR+",
      description: "Beautiful Victorian house with period features and modern amenities.",
      amenities: ["Garden", "Parking", "Period features"],
      images: ["/pending-victorian.png"],
      availableDate: "2025-11-15",
      landlordId: "landlord2",
      landlordName: "Emma Williams",
      landlordPhone: "020 7234 5678",
      landlordEmail: "emma@aceproperties.co.uk",
      featured: false
    },
    submittedBy: "landlord2",
    submittedDate: "2025-09-08",
    status: "pending"
  },
  {
    id: "pending3",
    propertyData: {
      title: "Luxury Penthouse in Shoreditch",
      price: 4500,
      deposit: 4500,
      address: "88 Commercial Street, E1 6LY",
      city: "London",
      state: "Greater London",
      bedrooms: 2,
      bathrooms: 2,
      propertyType: "2BR",
      description: "Stunning penthouse with private terrace and city views.",
      amenities: ["Terrace", "Gym", "Concierge", "Parking"],
      images: ["/pending-penthouse.png"],
      availableDate: "2025-12-01",
      landlordId: "landlord3",
      landlordName: "Oliver Davies",
      landlordPhone: "020 7345 6789",
      landlordEmail: "oliver@aceproperties.co.uk",
      featured: false
    },
    submittedBy: "landlord3",
    submittedDate: "2025-09-09",
    status: "pending"
  }
]
