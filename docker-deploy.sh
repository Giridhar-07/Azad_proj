#!/bin/bash

# Docker Deployment Script for Azayd Project

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH. Please install Docker."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed or not in PATH."
    exit 1
fi

# Check if .env.production.django exists
if [ ! -f ".env.production.django" ]; then
    echo "Error: .env.production.django file not found."
    echo "Please create this file with your production environment variables."
    exit 1
fi

# Generate SSL certificates if they don't exist
if [ ! -f "nginx/ssl/server.crt" ] || [ ! -f "nginx/ssl/server.key" ]; then
    echo "Generating SSL certificates for local development..."
    cd nginx
    bash ./generate-ssl-certs.sh
    cd ..
fi

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Check if containers are running
sleep 5
containers=$(docker-compose ps -q)
if [ -z "$containers" ]; then
    echo "Error: Failed to start containers. Check docker-compose logs for details."
    docker-compose logs
    exit 1
fi

# Apply database migrations
echo "Applying database migrations..."
docker-compose exec web python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
docker-compose exec web python manage.py collectstatic --noinput

# Create superuser if needed
read -p "Do you want to create a superuser? (y/n): " create_superuser
if [ "$create_superuser" = "y" ]; then
    echo "Creating superuser..."
    docker-compose exec web python manage.py createsuperuser
fi

# Display success message
echo -e "\nDeployment completed successfully!"
echo "Your application is now running at:"
echo "  - HTTPS: https://localhost"
echo "  - HTTP: http://localhost (redirects to HTTPS)"
echo "  - Admin: https://localhost/admin/"
echo "  - API: https://localhost/api/"
echo "  - Health Check: https://localhost/health/"

echo -e "\nTo stop the application, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"