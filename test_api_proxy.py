import requests
import json
import sys
import os

def test_gemini_proxy():
    """
    Test the Gemini API proxy endpoint.
    
    This script sends a test request to the Gemini API proxy endpoint and verifies that it works correctly.
    """
    print("Testing Gemini API proxy...")
    
    # The proxy endpoint URL
    proxy_url = "http://localhost:8000/api/proxy/gemini/"
    
    # Test request data
    request_data = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Hello, can you give me a brief introduction to Azayd IT Consulting?"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 100,
        }
    }
    
    try:
        # Send the request to the proxy endpoint
        response = requests.post(
            proxy_url,
            headers={
                'Content-Type': 'application/json',
            },
            json=request_data,
            timeout=30
        )
        
        # Check if the request was successful
        if response.status_code == 200:
            print("✅ Proxy test successful!")
            print("\nResponse:")
            response_data = response.json()
            
            # Extract and print the response text
            if 'candidates' in response_data and len(response_data['candidates']) > 0:
                candidate = response_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                    text = candidate['content']['parts'][0].get('text', '')
                    print(f"\n{text}\n")
                else:
                    print("\nNo text content in response.")
            else:
                print("\nNo candidates in response.")
                print(json.dumps(response_data, indent=2))
        else:
            print(f"❌ Proxy test failed with status code: {response.status_code}")
            print("\nError response:")
            print(json.dumps(response.json(), indent=2))
    
    except requests.RequestException as e:
        print(f"❌ Request error: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_gemini_proxy()