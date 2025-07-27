import os
import sys
import traceback

# Set up logging
log_file = 'magic_test.log'
with open(log_file, 'w') as f:
    f.write("=== Magic Library Test ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting magic library test...")
log(f"Python version: {sys.version}")
log(f"Current working directory: {os.getcwd()}")

# Try to import the magic module
log("\nTrying to import magic...")
try:
    import magic
    log("Successfully imported magic")
    log(f"Magic module: {magic.__file__}")
    log(f"Magic version: {magic.__version__ if hasattr(magic, '__version__') else 'Unknown'}")
    
    # Try to use magic to detect a simple text file
    test_file = 'test_magic_file.txt'
    with open(test_file, 'w') as f:
        f.write("This is a test file for magic")
    
    log("\nTesting magic.Magic(mime=True)...")
    try:
        mime = magic.Magic(mime=True)
        with open(test_file, 'rb') as f:
            content = f.read(2048)
            mime_type = mime.from_buffer(content)
            log(f"Detected MIME type for text file: {mime_type}")
    except Exception as e:
        log(f"ERROR with magic.Magic(mime=True): {str(e)}")
        log(traceback.format_exc())
    
    # Clean up test file
    os.remove(test_file)
    
except Exception as e:
    log(f"ERROR importing magic: {str(e)}")
    log(traceback.format_exc())

log("\nTest complete. See log file for details: " + log_file)