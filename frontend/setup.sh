#!/bin/bash

echo "🚀 Setting up Apartment Listing Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3001"
else
    echo "⚠️  Backend is not running on port 3001"
    echo "   Please start the backend server first:"
    echo "   cd ../backend && npm run dev"
fi

echo ""
echo "🎉 Frontend setup complete!"
echo ""
echo "To start the development server:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Make sure the backend is running on port 3001 for full functionality." 
 