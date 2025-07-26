# Apartment Listing Frontend

This is the frontend application for the Apartment Listing platform, built with Next.js 14, React 18, and TypeScript.

## Features

- **User Authentication**: Sign up, sign in, and role-based access control
- **Apartment Browsing**: View all available apartments with search and filtering
- **Favorites Management**: Add/remove apartments to favorites (for regular users)
- **Agent Management**: Create and manage apartment listings (for agents)
- **Admin Panel**: User management and system administration (for admins)
- **Responsive Design**: Mobile-friendly interface with burger menu navigation
- **Real-time Updates**: Dynamic navbar updates and role-based redirects

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Lucide React** - Icon library
- **CSS Modules** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 3001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API proxy routes
│   ├── admin/             # Admin panel pages
│   ├── apartment/         # Apartment detail pages
│   ├── favorites/         # User favorites page
│   ├── my-listings/       # Agent listings page
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ApartmentCard/     # Apartment card component
│   ├── ApartmentDetails/  # Apartment detail view
│   ├── AuthRedirect/      # Auth redirect component
│   ├── Header/            # Navigation header
│   ├── ProtectedRoute/    # Route protection component
│   └── SearchFilter/      # Search and filter component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── services/              # API services
    └── api.ts             # API client functions
```

## User Roles

### Regular User
- Browse apartments
- Add/remove favorites
- View apartment details

### Agent
- All user features
- Create apartment listings
- Manage own listings (edit, delete, toggle availability)

### Admin
- All agent features
- Access admin panel
- Manage all users (change roles, toggle status)
- View system statistics

## API Integration

The frontend communicates with the backend through Next.js API routes that proxy requests to `http://localhost:3001`. This setup allows for:

- CORS handling
- Authentication token management
- Error handling
- Request/response transformation

## Authentication Flow

1. **Sign Up**: Users can register as regular users or agents
2. **Sign In**: Users authenticate and receive a JWT token
3. **Token Storage**: Tokens are stored in localStorage
4. **Auto-redirect**: Users are redirected based on their role after login
5. **Route Protection**: Protected routes check authentication and roles
6. **Logout**: Tokens are cleared and users are redirected to signin

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Burger menu for mobile navigation
- Responsive grid layouts
- Touch-friendly interface elements

## Development

### Adding New Components

1. Create a new folder in `src/components/`
2. Include both `.tsx` and `.css` files
3. Export the component as default
4. Use CSS modules for styling

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Use the appropriate protection components if needed
4. Follow the existing styling patterns

### API Integration

1. Add new methods to `src/services/api.ts`
2. Create corresponding API routes in `src/app/api/`
3. Handle errors and loading states
4. Update TypeScript interfaces as needed 
 