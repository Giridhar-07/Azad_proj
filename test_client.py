import socket
import sys

PORT = 3000
HOST = '127.0.0.1'

try:
    # Create a socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)  # Set a timeout of 2 seconds
    
    # Connect to the server
    print(f"Attempting to connect to {HOST}:{PORT}...")
    result = sock.connect_ex((HOST, PORT))
    
    if result == 0:
        print(f"Successfully connected to {HOST}:{PORT}")
    else:
        print(f"Failed to connect to {HOST}:{PORT}, error code: {result}")
        # Print error description
        error_map = {
            10035: "The socket operation would block",
            10036: "A blocking operation is already in progress",
            10037: "Operation already in progress",
            10038: "Socket operation on nonsocket",
            10039: "Destination address required",
            10040: "Message too long",
            10041: "Protocol wrong type for socket",
            10042: "Bad protocol option",
            10043: "Protocol not supported",
            10044: "Socket type not supported",
            10045: "Operation not supported",
            10046: "Protocol family not supported",
            10047: "Address family not supported by protocol family",
            10048: "Address already in use",
            10049: "Cannot assign requested address",
            10050: "Network is down",
            10051: "Network is unreachable",
            10052: "Network dropped connection on reset",
            10053: "Software caused connection abort",
            10054: "Connection reset by peer",
            10055: "No buffer space available",
            10056: "Socket is already connected",
            10057: "Socket is not connected",
            10058: "Cannot send after socket shutdown",
            10060: "Connection timed out",
            10061: "Connection refused",
            10064: "Host is down",
            10065: "No route to host",
            10067: "Too many processes",
            10091: "Network subsystem is unavailable",
            10092: "WINSOCK.DLL version out of range",
            10093: "Successful WSAStartup not yet performed",
            10094: "Graceful shutdown in progress",
            11001: "Host not found",
            11002: "Nonauthoritative host not found",
            11003: "This is a nonrecoverable error",
            11004: "Valid name, no data record of requested type"
        }
        print(f"Error description: {error_map.get(result, 'Unknown error')}")
    
    sock.close()
    print("Socket closed")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)