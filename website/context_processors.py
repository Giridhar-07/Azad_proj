import secrets
from django.conf import settings
from django.templatetags.static import static

def security_context(request):
    """
    Context processor that adds security-related variables to all templates.
    
    This includes:
    - A CSRF token for AJAX requests
    - A nonce for Content Security Policy
    - Debug status (to conditionally show sensitive information)
    - Static URL for asset loading
    """
    # Generate a random nonce for CSP if not already in request
    if not hasattr(request, 'csp_nonce'):
        request.csp_nonce = secrets.token_urlsafe(16)
    
    # Get the static URL from settings
    static_url = settings.STATIC_URL if hasattr(settings, 'STATIC_URL') else '/static/'
    
    return {
        'csp_nonce': request.csp_nonce,
        'is_debug': settings.DEBUG,
        'debug': settings.DEBUG,  # Add explicit debug variable for templates
        'csrf_token_header': 'X-CSRFToken',
        'STATIC_URL': static_url,
    }