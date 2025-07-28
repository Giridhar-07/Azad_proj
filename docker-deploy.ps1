# Docker Deployment Script for Azayd Project

# Check if Docker is installed
try {
    docker --version
} catch {
    Write-Host "Error: Docker is not installed or not in PATH. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is installed
try {
    docker-compose --version
} catch {
    Write-Host "Error: docker-compose is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Check if .env.production.django exists
if (-not (Test-Path ".env.production.django")) {
    Write-Host "Error: .env.production.django file not found." -ForegroundColor Red
    Write-Host "Please create this file with your production environment variables." -ForegroundColor Yellow
    exit 1
}

# Generate SSL certificates if they don't exist
if (-not (Test-Path "nginx/ssl/server.crt") -or -not (Test-Path "nginx/ssl/server.key")) {
    Write-Host "Generating SSL certificates for local development..." -ForegroundColor Yellow
    cd nginx
    ./generate-ssl-certs.ps1
    cd ..
}

# Build and start the containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Green
docker-compose up -d --build

# Check if containers are running
Start-Sleep -Seconds 5
$containers = docker-compose ps -q
if (-not $containers) {
    Write-Host "Error: Failed to start containers. Check docker-compose logs for details." -ForegroundColor Red
    docker-compose logs
    exit 1
}

# Apply database migrations
Write-Host "Applying database migrations..." -ForegroundColor Green
docker-compose exec web python manage.py migrate --noinput

# Collect static files
Write-Host "Collecting static files..." -ForegroundColor Green
docker-compose exec web python manage.py collectstatic --noinput

# Create superuser if needed
$createSuperuser = Read-Host "Do you want to create a superuser? (y/n)"
if ($createSuperuser -eq "y") {
    Write-Host "Creating superuser..." -ForegroundColor Green
    docker-compose exec web python manage.py createsuperuser
}

# Display success message
Write-Host "\nDeployment completed successfully!" -ForegroundColor Green
Write-Host "Your application is now running at:" -ForegroundColor Green
Write-Host "  - HTTPS: https://localhost" -ForegroundColor Cyan
Write-Host "  - HTTP: http://localhost (redirects to HTTPS)" -ForegroundColor Cyan
Write-Host "  - Admin: https://localhost/admin/" -ForegroundColor Cyan
Write-Host "  - API: https://localhost/api/" -ForegroundColor Cyan
Write-Host "  - Health Check: https://localhost/health/" -ForegroundColor Cyan

Write-Host "\nTo stop the application, run: docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow