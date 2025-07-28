#!/bin/bash

# Create directory for SSL certificates
mkdir -p ssl

# Generate self-signed SSL certificate for local development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key -out ssl/server.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "Self-signed SSL certificates generated successfully!"
echo "Note: These certificates are for development purposes only."
echo "For production, use proper certificates from a trusted CA."