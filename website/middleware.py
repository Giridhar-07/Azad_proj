from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import secrets

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
            f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net",
            # Allow unsafe-inline for styles and scripts in development mode
            f"style-src 'self' 'unsafe-inline' 'nonce-{nonce}' https://fonts.googleapis.com" if settings.DEBUG else f"style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com",
            f"script-src 'self' 'unsafe-inline' 'nonce-{nonce}' https://cdn.jsdelivr.net" if settings.DEBUG else f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net",
            "img-src 'self' data: https://*",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' http://localhost:3000 http://localhost:8000 http://127.0.0.1:8080 https://api.openai.com https://generativelanguage.googleapis.com" if settings.DEBUG else "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        
        # Add CSP header
        response["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # Add other security headers
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # Add HSTS header in production
        if not settings.DEBUG:
            response["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Store the nonce in the request for template use
        request.csp_nonce = nonce
        
        return response