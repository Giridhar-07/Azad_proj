import os
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings
import logging

# Configure logging
logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def gemini_api_proxy(request):
    """
    Proxy endpoint for Gemini API requests.
    
    This endpoint securely forwards requests to the Gemini API without exposing the API key to the client.
    It handles authentication, error handling, and response formatting.
    """
    try:
        # Get the API key from environment variables
        api_key = os.environ.get('VITE_GEMINI_API_KEY', '')
        
        if not api_key:
            logger.error("Gemini API key not found in environment variables")
            return JsonResponse({
                'error': 'API configuration error',
                'message': 'The server is not properly configured for AI services.'
            }, status=500)
        
        # Parse the request body
        try:
            request_data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid request format',
                'message': 'Request must be valid JSON'
            }, status=400)
        
        # Construct the API URL
        api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
        
        # Forward the request to Gemini API
        response = requests.post(
            f"{api_url}?key={api_key}",
            headers={
                'Content-Type': 'application/json',
            },
            json=request_data,
            timeout=30  # Set a reasonable timeout
        )
        
        # Return the API response
        return JsonResponse(response.json(), status=response.status_code)
        
    except requests.RequestException as e:
        logger.error(f"Error forwarding request to Gemini API: {str(e)}")
        return JsonResponse({
            'error': 'API service error',
            'message': 'Unable to communicate with the AI service.'
        }, status=503)
    except Exception as e:
        logger.error(f"Unexpected error in Gemini API proxy: {str(e)}")
        return JsonResponse({
            'error': 'Server error',
            'message': 'An unexpected error occurred.'
        }, status=500)