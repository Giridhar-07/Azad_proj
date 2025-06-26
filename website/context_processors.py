import secrets
from django.conf import settings

def security_context(request):
    """
    Context processor that adds security-related variables to all templates.
    
    This includes:
    - A CSRF token for AJAX requests
    - A nonce for Content Security Policy
    - Debug status (to conditionally show sensitive information)
    """
    # Generate a random nonce for CSP if not already in request
    if not hasattr(request, 'csp_nonce'):
        request.csp_nonce = secrets.token_urlsafe(16)
    
    return {
        'csp_nonce': request.csp_nonce,
        'is_debug': settings.DEBUG,
        'csrf_token_header': 'X-CSRFToken',
    }