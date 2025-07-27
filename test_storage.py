import os
import sys
import traceback

# Set up logging
log_file = 'storage_test.log'
with open(log_file, 'w') as f:
    f.write("=== Storage Module Test ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting storage module test...")
log(f"Python version: {sys.version}")
log(f"Current working directory: {os.getcwd()}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

# Check Django without initializing
log("\nChecking Django installation...")
try:
    import django
    log(f"Django version: {django.get_version()}")
except ImportError as e:
    log(f"ERROR importing Django: {str(e)}")
    sys.exit(1)

# Try to import the storage module
log("\nTrying to import website.storage...")
try:
    from website.storage import SecureFileStorage
    log("Successfully imported SecureFileStorage")
    
    # Check if we can instantiate the storage class
    storage = SecureFileStorage()
    log("Successfully instantiated SecureFileStorage")
    log(f"Storage location: {storage.location}")
    log(f"Storage base_url: {storage.base_url}")
    
    # Check if python-magic is working
    log("\nChecking python-magic...")
    try:
        import magic
        log(f"python-magic version: {magic.__version__ if hasattr(magic, '__version__') else 'Unknown'}")
        
        # Try to use magic to detect a simple text file
        test_file = 'test_magic.txt'
        with open(test_file, 'w') as f:
            f.write("This is a test file for magic")
        
        mime = magic.Magic(mime=True)
        with open(test_file, 'rb') as f:
            content = f.read(2048)
            mime_type = mime.from_buffer(content)
            log(f"Detected MIME type for text file: {mime_type}")
        
        # Clean up test file
        os.remove(test_file)
        
    except Exception as e:
        log(f"ERROR with python-magic: {str(e)}")
        log(traceback.format_exc())
    
except Exception as e:
    log(f"ERROR importing or using SecureFileStorage: {str(e)}")
    log(traceback.format_exc())

log("\nTest complete. See log file for details: " + log_file)