import socket
import sys
import time

PORT = 8888  # Using a different port
HOST = '0.0.0.0'  # Bind to all interfaces

try:
    # Create a socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    # Bind the socket to the address
    print(f"Binding to {HOST}:{PORT}...")
    server_socket.bind((HOST, PORT))
    
    # Start listening
    server_socket.listen(5)
    print(f"Server is listening on {HOST}:{PORT}")
    print(f"Local access via: http://localhost:{PORT}/")
    print(f"Server socket: {server_socket}")
    print(f"Server socket family: {server_socket.family}")
    print(f"Server socket type: {server_socket.type}")
    print(f"Server socket fileno: {server_socket.fileno()}")
    
    # Set a timeout for accept
    server_socket.settimeout(60)  # 60 seconds timeout
    
    # Accept connections
    print("Waiting for a connection...")
    try:
        client_socket, client_address = server_socket.accept()
        print(f"Connection from {client_address}")
        
        # Send a message
        client_socket.send(b"Hello from the server!")
        
        # Close the connection
        client_socket.close()
    except socket.timeout:
        print("Timeout waiting for connection")
    
    server_socket.close()
    print("Server closed")
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)