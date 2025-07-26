# Apartment Finder

A modern apartment listing platform built for real estate agents, property managers, and home seekers. This full-stack application provides a complete solution for managing and discovering apartment listings with advanced search capabilities, role-based access control, and a responsive design that works seamlessly across all devices.

## What This App Does

**For Home Seekers:**
- Browse available apartments with detailed information
- Search and filter by location, price, bedrooms, and more
- Save favorite listings for easy access
- View high-quality images and property details
- Get real-time availability updates

**For Real Estate Agents:**
- Create and manage apartment listings
- Upload multiple images per property
- Set availability status (show/hide from public view)
- Track your listings and performance
- Manage property details and amenities

**For Administrators:**
- Oversee all listings and user accounts
- Manage developers, compounds, and amenities
- Control user roles and permissions
- Monitor system activity and performance
- Ensure data quality and consistency

## Tech Stack & Architecture

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- CSS Modules for component styling
- React Query for data fetching and caching
- Responsive design with mobile-first approach

**Backend:**
- Express.js with TypeScript
- Mongoose ODM for MongoDB
- JWT authentication with role-based access
- Class-validator for request validation
- Helmet for security headers

**Database:**
- MongoDB Atlas for cloud hosting
- Normalized schema with proper relationships
- Indexed queries for performance
- Data validation at the schema level

**Infrastructure:**
- Docker containers for easy deployment
- Nginx reverse proxy with rate limiting
- Environment-based configuration
- Health check endpoints

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- MongoDB Atlas account

### Quick Setup

**Option 1: Docker (Recommended - Easiest)**
```bash
git clone https://github.com/ZeyadW/Apartment-Finder
cd apartment-listing-app
./scripts/start.sh
```

**Option 2: Manual Setup**
1. **Clone and install:**
```bash
git clone https://github.com/ZeyadW/Apartment-Finder
cd apartment-listing-app
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Environment configuration:**
Create a `.env` file in the root directory:
```bash
# Backend Configuration
PORT=3001
MONGODB_URI=mongodb+srv://zeyad:zeyadwael@nawy.xrmjrzc.mongodb.net/?retryWrites=true&w=majority&appName=Nawy
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development


# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Start the application:**
```bash
# Development mode
npm run dev          # Frontend (port 3000)
cd backend && npm run dev  # Backend (port 3001)

# Or use Docker
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Project Structure

```
apartment-listing-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── config/          # Database and app config
│   │   ├── controllers/     # Request handlers
│   │   ├── dtos/            # Data transfer objects
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript definitions
│   └── seeders/             # Database seed data
├── nginx/                    # Reverse proxy config
├── scripts/                  # Utility scripts
└── docker-compose.yml        # Container orchestration
```

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # Build for production
npm run seed         # Seed database with sample data
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Database Management
The application uses MongoDB with Mongoose for data modeling. Key collections include:
- **Users**: Authentication and role management
- **Apartments**: Property listings with full details
- **Developers**: Property development companies
- **Compounds**: Residential compounds/communities
- **Amenities**: Available property amenities

## API Documentation

The backend provides a RESTful API with comprehensive endpoints for all functionality. All responses follow a consistent format and include proper error handling.

### Base URL
```
http://localhost:3001/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in your requests:
```
Authorization: Bearer <your_jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "count": 10
}
```

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

**Apartments:**
- `GET /api/apartments` - List all apartments (with filters)
- `POST /api/apartments` - Create new listing (agents/admins)
- `GET /api/apartments/:id` - Get specific apartment
- `PUT /api/apartments/:id` - Update listing
- `DELETE /api/apartments/:id` - Delete listing

**Management:**
- `GET /api/developers` - List developers
- `GET /api/compounds` - List compounds
- `GET /api/amenities` - List amenities

**User Features:**
- `GET /api/apartments/favorites` - User's favorite listings
- `POST /api/apartments/:id/favorite` - Add to favorites
- `GET /api/apartments/my-listings` - Agent's listings

### Search & Filtering
The apartment search supports multiple filters:
- **Text search**: Unit name, project, address
- **Location**: City, state, compound
- **Price range**: Min/max price filtering
- **Property details**: Bedrooms, bathrooms, square footage
- **Listing type**: Rent or sale
- **Availability**: Show/hide unavailable listings

### Pagination
List endpoints support pagination with `page` and `limit` parameters. Responses include a `count` field with the total number of items.

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "firstName": "string (2-50 chars)",
  "lastName": "string (2-50 chars)",
  "email": "string (unique, valid email)",
  "password": "string (hashed)",
  "role": "admin|agent|user",
  "phone": "string (optional)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Apartment
```json
{
  "_id": "ObjectId",
  "unitName": "string (max 100 chars)",
  "unitNumber": "string (max 20 chars)",
  "project": "string (max 200 chars)",
  "address": "string (max 500 chars)",
  "city": "string (max 100 chars)",
  "price": "number (0-999999999)",
  "listingType": "rent|sale",
  "bedrooms": "number (0-20)",
  "bathrooms": "number (0-20)",
  "squareFeet": "number (0-100000)",
  "description": "string (max 2000 chars)",
  "images": "string[] (URLs or base64)",
  "amenities": "ObjectId[] (references)",
  "developer": "ObjectId (reference)",
  "compound": "ObjectId (reference)",
  "agent": "ObjectId (reference)",
  "isAvailable": "boolean",
  "favorites": "ObjectId[] (user references)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, agent, and user permissions
- **Input Validation**: Comprehensive request validation
- **Security Headers**: XSS protection, content type options
- **Rate Limiting**: API endpoint protection
- **Password Hashing**: Bcrypt encryption for user passwords

## Error Handling

The API provides detailed error responses with appropriate HTTP status codes:
- **400**: Bad request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **409**: Conflict (duplicate resources)
- **422**: Unprocessable entity (validation details)
- **500**: Internal server error

## Docker Deployment

### Production Setup
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://zeyad:zeyadwael@nawy.xrmjrzc.mongodb.net/?retryWrites=true&w=majority&appName=Nawy
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Testing the Application

### Sample User Accounts
The application comes with pre-configured test accounts:

- **Admin User**: admin@apartmentapp.com / admin123
  - Full system access
  - User management capabilities
  - All listing management features

- **Agent User**: ahmed@apartmentapp.com / agent123
  - Create and manage apartment listings
  - Upload property images
  - Toggle listing availability

- **Regular User**: omar@apartmentapp.com / user123
  - Browse apartment listings
  - Save favorite properties
  - Search and filter functionality

### Database Seeding
To populate the database with sample data:
```bash
cd backend
npm run seed
```

This will create sample developers, compounds, amenities, and apartment listings for testing.

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Image Optimization**: Compressed image uploads
- **Caching**: React Query for frontend data caching
- **Pagination**: Efficient data loading for large datasets
- **Lazy Loading**: Component and image lazy loading

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 3001 is available

**Frontend can't connect to API:**
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS configuration

**Database connection issues:**
- Check MongoDB Atlas network access
- Verify connection string format
- Ensure database user has proper permissions

**Docker issues:**
- Check if Docker is running
- Verify docker-compose.yml configuration
- Check container logs for errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation
- Examine the error logs for specific issues
- Ensure all dependencies are properly installed

---

**Built with ❤️ for the real estate community** 