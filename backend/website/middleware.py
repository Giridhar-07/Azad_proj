from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import secrets
import logging

logger = logging.getLogger('django.security')

class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses.
    
    This middleware adds various security headers to HTTP responses to protect against
    common web vulnerabilities such as XSS, clickjacking, and MIME sniffing.
    """
    
    def process_response(self, request, response):
        # Generate a random nonce for CSP
        nonce = secrets.token_urlsafe(16)
        
        # Content Security Policy (CSP)
        csp_directives = [
            "default-src 'self'",
            f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://www.google-analytics.com",
            # Allow unsafe-inline for styles and scripts in development mode
            f"style-src 'self' 'unsafe-inline' 'nonce-{nonce}' https://fonts.googleapis.com" if settings.DEBUG else f"style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com",
            f"script-src 'self' 'unsafe-inline' 'nonce-{nonce}' https://cdn.jsdelivr.net https://www.google-analytics.com" if settings.DEBUG else f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://www.google-analytics.com",
            "img-src 'self' data: https://* https://www.google-analytics.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' http://localhost:3000 http://localhost:8000 http://127.0.0.1:8080 https://api.openai.com https://generativelanguage.googleapis.com https://www.google-analytics.com" if settings.DEBUG else "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://www.google-analytics.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests" if not settings.DEBUG else "",
            "block-all-mixed-content" if not settings.DEBUG else "",
        ]
        
        # Add CSP header
        response["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # Add other security headers
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()"
        
        # Add HSTS header in production
        if not settings.DEBUG:
            response["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        # Add Cache-Control header for non-static resources
        if not request.path.startswith(settings.STATIC_URL) and not request.path.startswith(settings.MEDIA_URL):
            response["Cache-Control"] = "no-store, max-age=0"
            
        # Log security headers in debug mode
        if settings.DEBUG:
            logger.debug(f"Security headers applied to {request.path}")
            logger.debug(f"CSP: {response.get('Content-Security-Policy', 'Not set')}")
            logger.debug(f"HSTS: {response.get('Strict-Transport-Security', 'Not set')}")
            logger.debug(f"X-Content-Type-Options: {response.get('X-Content-Type-Options', 'Not set')}")
            logger.debug(f"X-Frame-Options: {response.get('X-Frame-Options', 'Not set')}")
            logger.debug(f"X-XSS-Protection: {response.get('X-XSS-Protection', 'Not set')}")
            logger.debug(f"Referrer-Policy: {response.get('Referrer-Policy', 'Not set')}")
            logger.debug(f"Permissions-Policy: {response.get('Permissions-Policy', 'Not set')}")
            logger.debug(f"Cache-Control: {response.get('Cache-Control', 'Not set')}")
        
        
        # Store the nonce in the request for template use
        request.csp_nonce = nonce
        
        return response