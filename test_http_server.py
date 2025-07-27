import http.server
import socketserver

PORT = 8080

Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting HTTP server on port {PORT}...")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    httpd.serve_forever()