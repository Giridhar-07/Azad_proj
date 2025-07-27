import sys
import time
import importlib.util
import os

print(f"Python version: {sys.version}")
print(f"Current time: {time.strftime('%H:%M:%S')}")

def test_magic_functionality():
    print("\nTesting magic functionality...")
    try:
        # Import magic inside the function
        import magic
        print(f"Magic module imported successfully from: {magic.__file__}")
        
        # Create a temporary text file
        temp_file = 'temp_test_file.txt'
        with open(temp_file, 'w') as f:
            f.write('This is a test file for magic module')
        
        # Try to get the MIME type
        print("Attempting to get MIME type...")
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(temp_file)
        print(f"MIME type of test file: {file_type}")
        
        # Clean up
        os.remove(temp_file)
        print("Test file removed")
        
        return True
    except Exception as e:
        print(f"Error testing magic functionality: {e}")
        # Try to clean up if file exists
        if os.path.exists('temp_test_file.txt'):
            os.remove('temp_test_file.txt')
        return False

# Check if magic module exists without importing
magic_spec = importlib.util.find_spec('magic')
if magic_spec is not None:
    print(f"Magic module found at: {magic_spec.origin}")
    # Test functionality with a timeout
    import threading
    
    # Create a thread for testing
    test_thread = threading.Thread(target=test_magic_functionality)
    test_thread.daemon = True
    
    # Start the thread and wait for 10 seconds
    print("Starting magic functionality test with 10 second timeout...")
    test_thread.start()
    test_thread.join(10)
    
    if test_thread.is_alive():
        print("\nTimeout occurred while testing magic functionality")
        print("This suggests the magic module is hanging when used")
    else:
        print("\nMagic functionality test completed within timeout")
else:
    print("Magic module not found in sys.path")

print(f"\nFinished at: {time.strftime('%H:%M:%S')}")