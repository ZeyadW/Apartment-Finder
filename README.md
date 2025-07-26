# Apartment Listing App

A full-stack apartment listing application built with Next.js, Express.js, and MongoDB Atlas.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ZeyadW/apartment-listing-app.git
cd apartment-listing-app

# Start the application
./scripts/start.sh
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Features

- **User Management**: Admin, Agent, and User roles
- **Apartment Listings**: Create, edit, and manage apartment listings
- **Search & Filter**: Advanced search with multiple filters
- **Image Upload**: Multi-image upload with compression
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live availability toggles

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, CSS Modules
- **Backend**: Express.js, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **Containerization**: Docker & Docker Compose

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # Express.js API
├── scripts/           # Startup and utility scripts
├── nginx/             # Reverse proxy configuration
└── docker-compose.yml # Container orchestration
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
PORT=3001
MONGODB_URI=mongodb+srv://zeyad:zeyadwael@nawy.xrmjrzc.mongodb.net/?retryWrites=true&w=majority&appName=Nawy
# Additional required variables for Docker Compose
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3001

```

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev          # Frontend
cd backend && npm run dev  # Backend
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build
```

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "count": 10
}
```

### Pagination
For endpoints that return lists, pagination is supported:
- **Query Parameters**: `page` (default: 1), `limit` (default: 10)
- **Response**: Includes `count` field with total number of items

### Validation
The API uses class-validator for request validation. Invalid requests return:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "property": "fieldName",
      "constraints": {
        "isNotEmpty": "Field cannot be empty"
      }
    }
  ]
}
```

---

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "firstName": "string (2-50 chars, required)",
  "lastName": "string (2-50 chars, required)",
  "email": "string (valid email, unique, required)",
  "password": "string (6-128 chars, required, hashed)",
  "role": "enum: 'admin' | 'agent' | 'user' (default: 'user')",
  "phone": "string (optional, valid phone format)",
  "isActive": "boolean (default: true)",
  "lastLogin": "Date (optional)",
  "permissions": "string[] (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Apartment Model
```json
{
  "_id": "ObjectId",
  "unitName": "string (max 100 chars, required)",
  "unitNumber": "string (max 20 chars, required)",
  "project": "string (max 200 chars, required)",
  "address": "string (max 500 chars, required)",
  "city": "string (max 100 chars, required)",
  "price": "number (0-999999999, required)",
  "listingType": "enum: 'rent' | 'sale' (default: 'rent')",
  "bedrooms": "number (0-20, required)",
  "bathrooms": "number (0-20, required)",
  "squareFeet": "number (0-100000, required)",
  "description": "string (max 2000 chars, required)",
  "amenities": "ObjectId[] (references Amenity)",
  "images": "string[] (valid URLs or base64)",
  "isAvailable": "boolean (default: true)",
  "agent": "ObjectId (references User, required)",
  "favorites": "ObjectId[] (references User)",
  "developer": "ObjectId (references Developer, required)",
  "compound": "ObjectId (references Compound, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Developer Model
```json
{
  "_id": "ObjectId",
  "name": "string (unique, required)",
  "description": "string (optional)",
  "website": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Compound Model
```json
{
  "_id": "ObjectId",
  "name": "string (unique, required)",
  "location": "string (optional)",
  "description": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Amenity Model
```json
{
  "_id": "ObjectId",
  "name": "string (unique, required)",
  "description": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Authentication Endpoints

### `POST /api/auth/register`
Register a new user account.
- **Access**: Public
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123",
    "phone": "+201234567890",
    "role": "user"
  }
  ```
- **Validation**:
  - `firstName`: 2-50 characters, required
  - `lastName`: 2-50 characters, required
  - `email`: Valid email format, unique, required
  - `password`: 6-128 characters, required
  - `phone`: Optional, valid phone format
  - `role`: Optional, must be 'admin', 'agent', or 'user'
- **Response**: User object with JWT token
- **Error Codes**: 400 (validation), 409 (email exists), 500 (server error)

### `POST /api/auth/login`
Authenticate user and get JWT token.
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Validation**:
  - `email`: Valid email format, required
  - `password`: Required
- **Response**: User object with JWT token
- **Error Codes**: 400 (invalid credentials), 401 (unauthorized), 500 (server error)

### `GET /api/auth/me`
Get current authenticated user's profile.
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object
- **Error Codes**: 401 (no token), 500 (server error)

### `GET /api/auth/users`
Get all users (Admin only).
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of user objects
- **Error Codes**: 401 (no token), 403 (not admin), 500 (server error)

### `PUT /api/auth/users/:id/role`
Update user role (Admin only).
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "role": "agent"
  }
  ```
- **Validation**:
  - `role`: Must be 'admin', 'agent', or 'user'
- **Response**: Updated user object
- **Error Codes**: 400 (invalid role), 401 (no token), 403 (not admin), 404 (user not found), 500 (server error)

### `PUT /api/auth/users/:id/toggle-status`
Toggle user active status (Admin only).
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated user object
- **Error Codes**: 401 (no token), 403 (not admin), 404 (user not found), 500 (server error)

---

## Apartment Endpoints

### `GET /api/apartments`
Get all available apartments with search/filter.
- **Access**: Public
- **Query Parameters**:
  - `search`: Search in name, unit, project (string)
  - `city`: Filter by city (string)
  - `minPrice`: Minimum price (number, min: 0)
  - `maxPrice`: Maximum price (number, min: 0)
  - `bedrooms`: Number of bedrooms (number, 0-10)
  - `bathrooms`: Number of bathrooms (number, 0-10)
  - `listingType`: "rent" or "sale" (string)
  - `state`: Filter by state (string)
  - `compoundName`: Filter by compound name (string)
  - `developerName`: Filter by developer name (string)
  - `isAvailable`: Filter by availability (boolean)
  - `minSquareFeet`: Minimum square feet (number, min: 0)
  - `maxSquareFeet`: Maximum square feet (number, min: 0)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Array of apartment objects with pagination
- **Error Codes**: 400 (validation), 500 (server error)

### `GET /api/apartments/admin`
Get all apartments including unavailable ones (Admin only).
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: Same as above
- **Response**: Array of apartment objects
- **Error Codes**: 401 (no token), 403 (not admin), 500 (server error)

### `GET /api/apartments/my-listings`
Get current user's apartment listings.
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of apartment objects
- **Error Codes**: 401 (no token), 500 (server error)

### `GET /api/apartments/favorites`
Get user's favorite apartments.
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of apartment objects
- **Error Codes**: 401 (no token), 500 (server error)

### `GET /api/apartments/:id`
Get single apartment by ID.
- **Access**: Public
- **Response**: Apartment object with populated references
- **Error Codes**: 404 (not found), 500 (server error)

### `POST /api/apartments`
Create new apartment listing.
- **Access**: Agents and Admins
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "unitName": "Luxury Apartment",
    "unitNumber": "A101",
    "project": "Sunset Towers",
    "address": "123 Main St",
    "city": "Cairo",
    "price": 5000,
    "listingType": "rent",
    "bedrooms": 2,
    "bathrooms": 2,
    "squareFeet": 1200,
    "description": "Beautiful apartment with modern amenities...",
    "images": ["https://example.com/image1.jpg", "data:image/jpeg;base64,..."],
    "developer": "507f1f77bcf86cd799439011",
    "compound": "507f1f77bcf86cd799439012",
    "amenities": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
  }
  ```
- **Validation**:
  - `unitName`: Required, max 100 characters
  - `unitNumber`: Required, max 20 characters
  - `project`: Required, max 200 characters
  - `address`: Required, max 500 characters
  - `city`: Required, max 100 characters
  - `price`: Required, 0-999999999
  - `listingType`: Required, 'rent' or 'sale'
  - `bedrooms`: Required, 0-20
  - `bathrooms`: Required, 0-20
  - `squareFeet`: Required, 0-100000
  - `description`: Required, max 2000 characters
  - `images`: Array of valid URLs or base64 data URLs
  - `developer`: Required, valid ObjectId
  - `compound`: Required, valid ObjectId
  - `amenities`: Array of valid ObjectIds
- **Response**: Created apartment object
- **Error Codes**: 400 (validation), 401 (no token), 403 (not agent/admin), 500 (server error)

### `PUT /api/apartments/:id`
Update apartment listing.
- **Access**: Agents and Admins
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as POST
- **Response**: Updated apartment object
- **Error Codes**: 400 (validation), 401 (no token), 403 (not agent/admin), 404 (not found), 500 (server error)

### `DELETE /api/apartments/:id`
Delete apartment listing.
- **Access**: Agents and Admins
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Error Codes**: 401 (no token), 403 (not agent/admin), 404 (not found), 500 (server error)

### `PUT /api/apartments/:id/toggle-availability`
Toggle apartment availability (show/hide).
- **Access**: Agents and Admins
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated apartment object
- **Error Codes**: 401 (no token), 403 (not agent/admin), 404 (not found), 500 (server error)

### `POST /api/apartments/:id/favorite`
Add apartment to favorites.
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Error Codes**: 401 (no token), 404 (not found), 500 (server error)

### `DELETE /api/apartments/:id/favorite`
Remove apartment from favorites.
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Error Codes**: 401 (no token), 404 (not found), 500 (server error)

---

## Developer Endpoints

### `GET /api/developers`
Get all developers.
- **Access**: Public
- **Response**: Array of developer objects
- **Error Codes**: 500 (server error)

### `GET /api/developers/:id`
Get developer by ID.
- **Access**: Public
- **Response**: Developer object
- **Error Codes**: 404 (not found), 500 (server error)

### `POST /api/developers`
Create new developer.
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Developer Name",
    "description": "Developer description",
    "website": "https://developer.com"
  }
  ```
- **Validation**:
  - `name`: Required, unique, trimmed
  - `description`: Optional, trimmed
  - `website`: Optional, trimmed
- **Response**: Created developer object
- **Error Codes**: 400 (validation, name exists), 500 (server error)

### `PUT /api/developers/:id`
Update developer.
- **Access**: Public
- **Body**: Same as POST
- **Response**: Updated developer object
- **Error Codes**: 400 (validation), 404 (not found), 500 (server error)

### `DELETE /api/developers/:id`
Delete developer.
- **Access**: Public
- **Response**: Success message
- **Error Codes**: 404 (not found), 500 (server error)

---

## Compound Endpoints

### `GET /api/compounds`
Get all compounds.
- **Access**: Public
- **Response**: Array of compound objects
- **Error Codes**: 500 (server error)

### `GET /api/compounds/:id`
Get compound by ID.
- **Access**: Public
- **Response**: Compound object
- **Error Codes**: 404 (not found), 500 (server error)

### `POST /api/compounds`
Create new compound.
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Compound Name",
    "description": "Compound description",
    "location": "Compound location"
  }
  ```
- **Validation**:
  - `name`: Required, unique, trimmed
  - `description`: Optional, trimmed
  - `location`: Optional, trimmed
- **Response**: Created compound object
- **Error Codes**: 400 (validation, name exists), 500 (server error)

### `PUT /api/compounds/:id`
Update compound.
- **Access**: Public
- **Body**: Same as POST
- **Response**: Updated compound object
- **Error Codes**: 400 (validation), 404 (not found), 500 (server error)

### `DELETE /api/compounds/:id`
Delete compound.
- **Access**: Public
- **Response**: Success message
- **Error Codes**: 404 (not found), 500 (server error)

---

## Amenity Endpoints

### `GET /api/amenities`
Get all amenities.
- **Access**: Public
- **Response**: Array of amenity objects (sorted by name)
- **Error Codes**: 500 (server error)

### `POST /api/amenities`
Create new amenity.
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Swimming Pool",
    "description": "Outdoor swimming pool"
  }
  ```
- **Validation**:
  - `name`: Required, unique, trimmed
  - `description`: Optional, trimmed
- **Response**: Created amenity object
- **Error Codes**: 400 (validation, name exists), 500 (server error)

### `PUT /api/amenities/:id`
Update amenity.
- **Access**: Public
- **Body**: Same as POST
- **Response**: Updated amenity object
- **Error Codes**: 400 (validation), 404 (not found), 500 (server error)

### `DELETE /api/amenities/:id`
Delete amenity.
- **Access**: Public
- **Response**: Success message
- **Error Codes**: 404 (not found), 500 (server error)

---

## Health Check

### `GET /health`
Check server status.
- **Access**: Public
- **Response**:
  ```json
  {
    "message": "Server is running"
  }
  ```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Invalid data provided",
  "errors": [
    {
      "property": "fieldName",
      "constraints": {
        "isNotEmpty": "Field cannot be empty"
      }
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting through Nginx:
- **API endpoints**: 20 requests per second with burst allowance
- **Health check**: No rate limiting
- **Frontend routes**: No rate limiting

---

## Security Headers

The API includes the following security headers via Helmet:
- `X-Frame-Options`: SAMEORIGIN
- `X-XSS-Protection`: 1; mode=block
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: no-referrer-when-downgrade
- `Content-Security-Policy`: default-src 'self' http: https: data: blob: 'unsafe-inline'

## Sample Users

- **Admin**: admin@apartmentapp.com / admin123
- **Agent**: ahmed@apartmentapp.com / agent123
- **User**: omar@apartmentapp.com / user123

## License

MIT 