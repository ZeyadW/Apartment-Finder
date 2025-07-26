# Apartment Listing Application Makefile

.PHONY: help start stop restart build logs clean seed test

# Default target
help:
	@echo "🏠 Apartment Listing Application"
	@echo "================================"
	@echo ""
	@echo "Available commands:"
	@echo "  start     - Start the application"
	@echo "  stop      - Stop the application"
	@echo "  restart   - Restart the application"
	@echo "  build     - Build Docker images"
	@echo "  logs      - View application logs"
	@echo "  clean     - Clean up containers and volumes"
	@echo "  seed      - Seed the database"
	@echo "  test      - Run tests"
	@echo "  status    - Show service status"
	@echo "  health    - Check health endpoints"
	@echo "  production - Start with production profile"

# Start the application
start:
	@echo "🚀 Starting Apartment Listing Application..."
	./scripts/start.sh

# Stop the application
stop:
	@echo "🛑 Stopping application..."
	docker-compose down

# Restart the application
restart: stop start

# Build Docker images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache

# View logs
logs:
	@echo "📋 Viewing application logs..."
	docker-compose logs -f

# Clean up
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Seed database
seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend npm run seed

# Run tests
test:
	@echo "🧪 Running tests..."
	@echo "Backend tests:"
	cd backend && npm test
	@echo "Frontend tests:"
	cd frontend && npm test

# Show service status
status:
	@echo "📊 Service Status:"
	docker-compose ps

# Check health endpoints
health:
	@echo "🏥 Checking health endpoints..."
	@echo "Frontend:"
	curl -f http://localhost:3000 || echo "❌ Frontend not responding"
	@echo "Backend:"
	curl -f http://localhost:3001/health || echo "❌ Backend not responding"

# Start with production profile
production:
	@echo "🌐 Starting production deployment..."
	docker-compose --profile production up -d

# Development mode
dev:
	@echo "🔧 Starting development mode..."
	docker-compose up

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install

# Update dependencies
update:
	@echo "🔄 Updating dependencies..."
	cd backend && npm update
	cd frontend && npm update

# Note: Database backup/restore not available with MongoDB Atlas
# Use MongoDB Atlas dashboard for database management

# Show resource usage
resources:
	@echo "📈 Container resource usage:"
	docker stats --no-stream

# Show disk usage
disk:
	@echo "💿 Docker disk usage:"
	docker system df 