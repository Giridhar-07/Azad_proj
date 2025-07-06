import socket
import sys

PORT = 8888  # Updated to match server port
HOST = '127.0.0.1'  # Connect to localhost

try:
    # Create a socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.settimeout(5)  # Set a timeout of 5 seconds
    
    # Connect to the server
    print(f"Attempting to connect to {HOST}:{PORT}...")
    client_socket.connect((HOST, PORT))
    print(f"Connected to {HOST}:{PORT}")
    
    # Receive data
    data = client_socket.recv(1024)
    print(f"Received: {data.decode('utf-8')}")
    
    # Close the connection
    client_socket.close()
    print("Client closed")
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)