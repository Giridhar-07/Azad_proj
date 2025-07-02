import http.server
import socketserver
import socket
import sys
import os

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

# Custom TCPServer class that allows reuse of the address
class CustomTCPServer(socketserver.TCPServer):
    allow_reuse_address = True
    
    def server_bind(self):
        # Set socket options for Windows
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 0)
        if hasattr(socket, 'SO_REUSEADDR'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        # Bind the socket
        self.socket.bind(self.server_address)
        host, port = self.socket.getsockname()[:2]
        self.server_name = socket.getfqdn(host)
        self.server_port = port

try:
    # Create socket and bind to address for testing
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("127.0.0.1", PORT))
    print(f"Successfully bound test socket to 127.0.0.1:{PORT}")
    sock.close()
    
    # Now start the HTTP server
    with CustomTCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Server running at http://127.0.0.1:{PORT}/")
        print(f"Local access via: http://localhost:{PORT}/")
        print(f"Server socket: {httpd.socket}")
        print(f"Server socket family: {httpd.socket.family}")
        print(f"Server socket type: {httpd.socket.type}")
        print(f"Server socket fileno: {httpd.socket.fileno()}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Process ID: {os.getpid()}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)