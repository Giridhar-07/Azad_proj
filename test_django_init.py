import os
import sys
import time
import django

# Log file
log_file = 'django_init_test.log'

def log_message(message):
    """Log a message with timestamp"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")
    print(message)

def main():
    """Test Django initialization and module imports"""
    try:
        # Log Python version
        log_message(f"Python version: {sys.version}")
        
        # Import and check Django version
        log_message(f"Django version: {django.get_version()}")
        
        # Set Django settings module
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
        log_message(f"Set DJANGO_SETTINGS_MODULE to {os.environ.get('DJANGO_SETTINGS_MODULE')}")
        
        # Initialize Django
        log_message("Initializing Django...")
        django.setup()
        log_message("Django initialized successfully")
        
        # Test importing website modules
        modules_to_test = [
            'website',
            'website.models',
            'website.views',
            'website.urls',
            'website.admin',
            'website.storage',
        ]
        
        for module_name in modules_to_test:
            try:
                log_message(f"Importing {module_name}...")
                module = __import__(module_name, fromlist=['*'])
                log_message(f"Successfully imported {module_name}")
                
                # For storage module, test creating an instance
                if module_name == 'website.storage':
                    from website.storage import SecureFileStorage
                    storage = SecureFileStorage()
                    log_message(f"Successfully created SecureFileStorage instance")
                    
            except Exception as e:
                log_message(f"Error importing {module_name}: {e}")
        
        return True
    except Exception as e:
        log_message(f"Error during Django initialization: {e}")
        import traceback
        log_message(traceback.format_exc())
        return False

if __name__ == '__main__':
    log_message("Starting Django initialization test")
    success = main()
    if success:
        log_message("Django initialization test completed successfully")
    else:
        log_message("Django initialization test failed")