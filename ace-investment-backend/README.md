# Ace Investment Properties Backend

A complete Node.js backend API for the Ace Investment Properties platform with Supabase integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with Supabase Auth
- **User Management**: Profile management for investors, landlords, and tenants
- **Property Management**: CRUD operations for property listings
- **Investment System**: Property investment tracking and management
- **Rental Applications**: Complete rental application workflow
- **Favorites System**: Save and manage favorite properties
- **Role-Based Access Control**: Different permissions for different user types
- **Security**: Rate limiting, CORS, validation, and security headers
- **Database**: PostgreSQL with Supabase and Row Level Security (RLS)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Project Structure

```
ace-investment-backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── profile.js           # User profile routes
│   ├── properties.js        # Property management routes
│   ├── investments.js       # Investment routes
│   ├── applications.js      # Rental application routes
│   └── favorites.js         # Favorites routes
├── utils/
│   └── database.js          # Database utility functions
├── migrations/
│   ├── 001_create_profiles_table.sql
│   ├── 002_create_properties_table.sql
│   ├── 003_create_investments_table.sql
│   ├── 004_create_rental_applications_table.sql
│   ├── 005_create_favorites_table.sql
│   └── 006_create_additional_tables.sql
├── .env.example
├── .env
├── server.js
└── package.json
```

## Setup Instructions

### 1. Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables with your actual values:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `JWT_SECRET`: A secure random string for JWT signing
- `FRONTEND_URL`: Your frontend application URL

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration files in order in your Supabase SQL editor:
   - `migrations/001_create_profiles_table.sql`
   - `migrations/002_create_properties_table.sql`
   - `migrations/003_create_investments_table.sql`
   - `migrations/004_create_rental_applications_table.sql`
   - `migrations/005_create_favorites_table.sql`
   - `migrations/006_create_additional_tables.sql`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Profile Management
- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update current user's profile
- `PUT /api/profile/complete` - Mark profile as complete
- `GET /api/profile/:id` - Get public profile by ID

### Properties
- `GET /api/properties` - Get available properties (with filtering)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property (landlords only)
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `GET /api/properties/landlord/my-properties` - Get landlord's properties

### Investments
- `GET /api/investments` - Get user's investments (investors only)
- `GET /api/investments/:id` - Get investment details
- `POST /api/investments` - Create new investment (investors only)
- `PUT /api/investments/:id` - Update investment (pending only)
- `PUT /api/investments/:id/status` - Approve/reject investment (landlords only)

### Rental Applications
- `GET /api/applications` - Get user's applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Submit rental application (tenants only)
- `PUT /api/applications/:id` - Update application (tenants only)
- `PUT /api/applications/:id/status` - Review application (landlords only)
- `PUT /api/applications/:id/withdraw` - Withdraw application (tenants only)

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add property to favorites
- `PUT /api/favorites/:id` - Update favorite notes
- `DELETE /api/favorites/:id` - Remove from favorites
- `DELETE /api/favorites/property/:property_id` - Remove by property ID
- `GET /api/favorites/check/:property_id` - Check if property is favorited

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **Security Headers**: Using Helmet for security headers
- **Input Validation**: Comprehensive validation using express-validator
- **Authentication**: JWT-based authentication with Supabase
- **Authorization**: Role-based access control
- **Row Level Security**: Database-level security with RLS policies

## Database Schema

### User Types
- **Investor**: Can invest in properties, save favorites
- **Landlord**: Can create and manage properties, review applications
- **Tenant**: Can apply for rentals, save favorites

### Key Tables
- `profiles`: User profiles and account information
- `properties`: Property listings with full details
- `investments`: Investment records and tracking
- `rental_applications`: Rental application workflow
- `favorites`: Saved properties for users
- `viewings`: Property viewing appointments
- `notifications`: User notifications
- `property_analytics`: Property performance metrics

## Development

### Adding New Routes

1. Create route file in `routes/` directory
2. Add route to `server.js`
3. Add appropriate middleware for authentication and validation
4. Test with Postman or similar tool

### Adding New Database Tables

1. Create migration SQL file in `migrations/` directory
2. Include RLS policies and indexes
3. Update database utility functions if needed
4. Add validation rules for new fields

### Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional details (development only)"
  }
}
```

## Deployment

### Environment Variables for Production

Ensure these are set securely in production:
- `NODE_ENV=production`
- `JWT_SECRET` - Use a strong, unique secret
- Update `FRONTEND_URL` to your production frontend URL
- Configure proper SMTP settings for email notifications

### Production Considerations

1. Enable SSL/TLS
2. Use a process manager like PM2
3. Set up proper logging
4. Configure database connection pooling
5. Implement proper backup strategies
6. Set up monitoring and alerts

## Testing

Currently, testing is not implemented. Recommended testing stack:
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **Database Tests**: Test database with seed data

## License

This project is private and proprietary to Ace Investment Properties.