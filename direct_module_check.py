import os
import sys
import time
import importlib
import traceback

# Set up logging
log_file = 'direct_module_check.log'
with open(log_file, 'w') as f:
    f.write("=== Direct Module Check ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting direct module check...")
log(f"Python version: {sys.version}")
log(f"Current working directory: {os.getcwd()}")

# Check Django without initializing
log("\nChecking Django installation...")
try:
    import django
    log(f"Django version: {django.get_version()}")
except ImportError as e:
    log(f"ERROR importing Django: {str(e)}")
    sys.exit(1)

# Check django_filters separately
log("\nChecking django_filters...")
try:
    import django_filters
    log(f"django_filters version: {django_filters.__version__}")
except ImportError as e:
    log(f"ERROR importing django_filters: {str(e)}")
    log("You may need to install django-filter: pip install django-filter")

# Function to check a module directly
def check_module(module_name):
    log(f"\nChecking {module_name}...")
    try:
        start_time = time.time()
        module = importlib.import_module(module_name)
        elapsed = time.time() - start_time
        log(f"Successfully imported {module_name} in {elapsed:.2f} seconds")
        
        # Try to get the module file path
        try:
            log(f"Module file: {module.__file__}")
        except AttributeError:
            log("Module has no __file__ attribute")
        
        # List attributes that don't start with underscore
        log("Module contents:")
        attrs = [attr for attr in dir(module) if not attr.startswith('_')]
        if attrs:
            for attr in attrs[:10]:  # Limit to first 10 to avoid excessive output
                log(f"  - {attr}")
            if len(attrs) > 10:
                log(f"  ... and {len(attrs) - 10} more")
        else:
            log("  No public attributes found")
            
        return True
    except ImportError as e:
        log(f"ERROR importing {module_name}: {str(e)}")
        return False
    except Exception as e:
        log(f"ERROR checking {module_name}: {str(e)}")
        log(traceback.format_exc())
        return False

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

# Check if we can import the website package itself
log("\nChecking website package...")
check_module('website')

# List of modules to check
modules = [
    'website.models',
    'website.views',
    'website.api_views',
    'website.urls',
    'website.admin',
    'website.apps',
    'website.forms',
    'website.serializers',
    'website.filters',
    'website.middleware',
]

# Check each module individually
for module in modules:
    check_module(module)

# Try to check Django settings
log("\nChecking Django settings module...")
check_module('azayd.settings')

# Try to check Django conf settings
log("\nChecking Django conf settings...")
check_module('django.conf.settings')

log("\nCheck complete. See log file for details: " + log_file)