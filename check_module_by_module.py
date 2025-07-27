import os
import sys
import time
import importlib
import traceback
import subprocess

# Set up logging
log_file = 'module_check.log'
with open(log_file, 'w') as f:
    f.write("=== Module-by-Module Check ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting module-by-module check...")
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

# Function to check a module in a separate process with timeout
def check_module_with_timeout(module_name, timeout=5):
    log(f"\nChecking {module_name} in a separate process (timeout: {timeout}s)...")
    
    # Create a temporary script to import the module
    temp_script = f"check_{module_name.replace('.', '_')}.py"
    with open(temp_script, 'w') as f:
        f.write(f'''
import sys
import traceback

try:
    print("Attempting to import {module_name}...")
    import {module_name}
    print("Successfully imported {module_name}")
    
    # Try to get the module file path
    try:
        print("Module file: " + str({module_name}.__file__))
    except:
        print("Could not get module file path")
    
    # List attributes that don't start with underscore
    print("\nModule contents:")
    for attr in dir({module_name}):
        if not attr.startswith('_'):
            print("  - " + attr)
            
except Exception as e:
    print("ERROR importing {module_name}: " + str(e))
    traceback.print_exc()
    sys.exit(1)
''')
    
    try:
        # Run the script with a timeout
        result = subprocess.run(
            [sys.executable, temp_script],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        # Process the result
        log(f"Process exit code: {result.returncode}")
        if result.stdout:
            log(f"Output:\n{result.stdout}")
        if result.stderr:
            log(f"Errors:\n{result.stderr}")
            
        success = result.returncode == 0
        log(f"Module check {'succeeded' if success else 'failed'}")
        return success
        
    except subprocess.TimeoutExpired:
        log(f"TIMEOUT: Module check for {module_name} took longer than {timeout} seconds")
        log("This might indicate an infinite loop or deadlock in the module")
        return False
    except Exception as e:
        log(f"ERROR checking module {module_name}: {str(e)}")
        traceback.print_exc()
        return False
    finally:
        # Clean up the temporary script
        try:
            os.remove(temp_script)
        except:
            pass

# Check if we can import the website package itself
log("\nChecking website package...")
check_module_with_timeout('website')

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
    check_module_with_timeout(module)

# Try to check Django settings without initializing Django
log("\nChecking Django settings module...")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
    log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    
    # Try to import settings directly (this might initialize Django partially)
    check_module_with_timeout('azayd.settings')
    
    # Check if django_filters is in INSTALLED_APPS
    check_module_with_timeout('django.conf.settings', timeout=10)
    
except Exception as e:
    log(f"ERROR checking Django settings: {str(e)}")
    traceback.print_exc()

log("\nCheck complete. See log file for details: " + log_file)