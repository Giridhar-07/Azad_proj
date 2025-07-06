import socket
import sys

def check_loopback():
    try:
        # Try to create a socket and bind it to the loopback interface
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind(('127.0.0.1', 0))  # Bind to any available port
        port = s.getsockname()[1]
        print(f"Successfully bound to 127.0.0.1:{port}")
        
        # Try to connect to the socket we just created
        c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        c.settimeout(5)
        print(f"Attempting to connect to 127.0.0.1:{port}...")
        c.connect(('127.0.0.1', port))
        print(f"Successfully connected to 127.0.0.1:{port}")
        
        # Clean up
        c.close()
        s.close()
        print("Loopback interface is working correctly!")
        return True
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    print("Checking loopback interface...")
    result = check_loopback()
    if result:
        print("Loopback test passed!")
        sys.exit(0)
    else:
        print("Loopback test failed!", file=sys.stderr)
        sys.exit(1)