import os
import sys
import time
import importlib
import traceback
import threading

# Set up logging
log_file = 'models_check.log'
with open(log_file, 'w') as f:
    f.write("=== Models Module Check ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting models module check...")
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

# Function to import a module with timeout
def import_with_timeout(module_name, timeout=5):
    result = {"success": False, "error": None, "module": None}
    
    def import_module_target():
        try:
            log(f"Attempting to import {module_name}...")
            module = importlib.import_module(module_name)
            result["success"] = True
            result["module"] = module
            log(f"Successfully imported {module_name}")
        except Exception as e:
            result["error"] = str(e)
            log(f"ERROR importing {module_name}: {str(e)}")
            log(traceback.format_exc())
    
    # Create and start the thread
    thread = threading.Thread(target=import_module_target)
    thread.daemon = True
    
    log(f"Starting import with {timeout}s timeout...")
    start_time = time.time()
    thread.start()
    thread.join(timeout)
    elapsed = time.time() - start_time
    
    if thread.is_alive():
        log(f"TIMEOUT: Import of {module_name} took longer than {timeout} seconds")
        log("This might indicate an infinite loop or deadlock in the module")
        return False, None
    
    if result["success"]:
        log(f"Import completed in {elapsed:.2f} seconds")
        return True, result["module"]
    else:
        log(f"Import failed after {elapsed:.2f} seconds")
        return False, None

# Try to import website.models with a timeout
log("\nChecking website.models with timeout...")
success, models_module = import_with_timeout('website.models', timeout=10)

if success:
    log("\nSuccessfully imported website.models")
    
    # Try to get the module file path
    try:
        log(f"Module file: {models_module.__file__}")
    except AttributeError:
        log("Module has no __file__ attribute")
    
    # List attributes that don't start with underscore
    log("Module contents:")
    attrs = [attr for attr in dir(models_module) if not attr.startswith('_')]
    if attrs:
        for attr in attrs[:20]:  # Show more attributes for models
            log(f"  - {attr}")
            
            # Try to get more info about model classes
            try:
                obj = getattr(models_module, attr)
                if hasattr(obj, '__module__') and obj.__module__ == 'website.models':
                    log(f"    Type: {type(obj).__name__}")
                    if hasattr(obj, '_meta') and hasattr(obj._meta, 'fields'):
                        log(f"    Fields: {[f.name for f in obj._meta.fields][:5]}")
            except Exception as e:
                pass  # Silently ignore errors in attribute inspection
                
        if len(attrs) > 20:
            log(f"  ... and {len(attrs) - 20} more")
    else:
        log("  No public attributes found")
else:
    log("Failed to import website.models within the timeout period")

# Try to import each model-related module individually
log("\nChecking individual model-related files...")

# Check if we can import the models.py file directly
try:
    import website
    log(f"website package path: {website.__path__ if hasattr(website, '__path__') else 'No path'}")
    
    # Try to list files in the website directory
    try:
        import os.path
        if hasattr(website, '__path__'):
            website_dir = website.__path__[0]
            log(f"Files in website directory:")
            for filename in os.listdir(website_dir):
                log(f"  - {filename}")
    except Exception as e:
        log(f"Error listing website directory: {str(e)}")
        
except Exception as e:
    log(f"Error accessing website package: {str(e)}")

log("\nCheck complete. See log file for details: " + log_file)