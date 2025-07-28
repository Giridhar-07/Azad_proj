# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=azayd.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmagic-dev \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Install Node.js dependencies and build frontend
RUN npm ci
RUN npm run build:prod

# Collect static files
RUN python manage.py collectstatic --noinput

# Create and set permissions for log files
RUN touch security.log django_errors.log \
    && chmod 640 security.log django_errors.log

# Create media directory with proper permissions
RUN mkdir -p media/uploads \
    && chmod 755 media \
    && chmod 755 media/uploads

# Expose port
EXPOSE 8000

# Start gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "azayd.wsgi:application"]