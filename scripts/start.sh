#!/bin/bash

# Apartment Listing Application Startup Script
# This script handles the complete deployment of the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to stop existing containers
stop_existing_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans || true
    print_success "Existing containers stopped"
}

# Function to build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_success "Backend API is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend failed to start within 60 seconds"
        exit 1
    fi
}

# Function to seed the database
seed_database() {
    print_status "Seeding the database..."
    
    # Wait a bit for MongoDB to be fully ready
    sleep 5
    
    # Run the seeder
    if docker-compose exec -T backend npm run seed; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding failed, but continuing..."
    fi
}

# Function to display service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_success "Application is running!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "📊 Database: MongoDB Atlas (Cloud)"
    echo ""
    echo "📝 Sample Login Credentials:"
    echo "   Admin: admin@apartmentapp.com / admin123"
    echo "   Agent: ahmed@apartmentapp.com / agent123"
    echo "   User: omar@apartmentapp.com / user123"
    echo ""
    echo "🔍 Health Checks:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:3001/health"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Rebuild: docker-compose up --build"
}

# Function to handle cleanup on script exit
cleanup() {
    print_status "Cleaning up..."
    # Add any cleanup tasks here
}

# Set up trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🏠 Apartment Listing Application Startup"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Stop existing containers
    stop_existing_containers
    
    # Start services
    start_services
    
    # Wait for services to be ready
    wait_for_services
    
    # Seed database
    seed_database
    
    # Show status
    show_status
}

# Run main function
main "$@" 