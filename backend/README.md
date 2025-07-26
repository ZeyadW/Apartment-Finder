# Apartment Listing Backend

A Node.js TypeScript backend for the apartment listing application.

## Features

- RESTful API for apartment management
- MongoDB integration with Mongoose
- Search and filter functionality
- TypeScript support
- CORS enabled for frontend integration

## API Endpoints

- `GET /api/apartments` - Get all apartments (with search/filter)
- `GET /api/apartments/:id` - Get single apartment
- `POST /api/apartments` - Create new apartment
- `PUT /api/apartments/:id` - Update apartment
- `DELETE /api/apartments/:id` - Delete apartment

## Search & Filter Parameters

- `search` - Search by unit name, unit number, or project
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `bedrooms` - Number of bedrooms filter
- `bathrooms` - Number of bathrooms filter
- `city` - City filter
- `state` - State filter

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file based on `env.example`:
   ```bash
   cp env.example .env
   ```

3. Update `.env` with your MongoDB connection string

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production) 