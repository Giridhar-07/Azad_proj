from flask import Flask
import socket
import sys

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    try:
        # Get hostname and IP address
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        print(f"Hostname: {hostname}")
        print(f"IP Address: {ip_address}")
        print(f"Starting Flask server on http://127.0.0.1:5000/")
        
        # Run the Flask app
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)