import os
import sys
import django
import time

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')

print(f"Python version: {sys.version}")
print(f"Current time: {time.strftime('%H:%M:%S')}")

try:
    print("Setting up Django...")
    django.setup()
    print("Django setup complete")
    
    # Import the fixed storage class
    print("Importing fixed storage class...")
    from website.storage_fixed import SecureFileStorage
    print("Successfully imported SecureFileStorage from fixed module")
    
    # Create an instance of the storage class
    print("Creating storage instance...")
    storage = SecureFileStorage()
    print(f"Storage instance created: {storage}")
    
    # Test with a temporary file
    print("\nTesting storage functionality...")
    
    # Create a test file
    test_file_path = 'test_document.pdf'
    with open(test_file_path, 'wb') as f:
        # Write a simple PDF-like header (not a real PDF)
        f.write(b'%PDF-1.4\n%Test document')
        f.write(b'\n' * 10)
        f.write(b'Test content')
    
    print(f"Created test file: {test_file_path}")
    
    # Open the file for testing
    with open(test_file_path, 'rb') as f:
        from django.core.files.base import File
        django_file = File(f)
        
        # Test the storage save method
        print("Testing storage save method...")
        saved_path = storage.save('uploads/test.pdf', django_file)
        print(f"File saved to: {saved_path}")
        
        # Check if file exists in storage
        print(f"Checking if file exists in storage: {storage.exists(saved_path)}")
        
        # Clean up
        print("Cleaning up...")
        storage.delete(saved_path)
        print(f"Deleted file from storage: {saved_path}")
    
    # Remove the test file
    os.remove(test_file_path)
    print(f"Removed test file: {test_file_path}")
    
    print("\nStorage test completed successfully")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print(f"\nFinished at: {time.strftime('%H:%M:%S')}")