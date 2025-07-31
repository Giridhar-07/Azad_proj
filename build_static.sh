#!/bin/bash

# Install Python and pip
apt-get update && apt-get install -y python3 python3-pip
ln -sf /usr/bin/python3 /usr/bin/python
ln -sf /usr/bin/pip3 /usr/bin/pip

# Install dependencies
pip install -r requirements.txt

# Install python-magic and python-magic-bin for Windows
pip install python-magic python-magic-bin

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create security log file with proper permissions
touch security.log
chmod 640 security.log

# Create error log file with proper permissions
touch django_errors.log
chmod 640 django_errors.log

# Set proper permissions for media directory
mkdir -p media/uploads
chmod -R 755 media
chmod -R 644 media/*

echo "Build completed successfully!"