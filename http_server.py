import http.server
import socketserver
import sys

PORT = 8000
HOST = '0.0.0.0'  # Bind to all interfaces

try:
    # Create a simple HTTP server
    handler = http.server.SimpleHTTPRequestHandler
    
    # Create the server
    with socketserver.TCPServer((HOST, PORT), handler) as httpd:
        print(f"Server started at http://{HOST}:{PORT}/")
        print(f"Local access via: http://localhost:{PORT}/")
        print(f"Server socket: {httpd.socket}")
        print(f"Server socket family: {httpd.socket.family}")
        print(f"Server socket type: {httpd.socket.type}")
        print(f"Server socket fileno: {httpd.socket.fileno()}")
        
        # Serve until interrupted
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
        
except KeyboardInterrupt:
    print("\nServer stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)