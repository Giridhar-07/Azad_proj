import os
import sys
import django
import traceback
import socket
from datetime import datetime

# Create a log file
log_file = 'django_diagnostic_output.log'
with open(log_file, 'w') as f:
    f.write(f"=== Django Diagnostic Run: {datetime.now()} ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting Django diagnostics...")
log(f"Python version: {sys.version}")

# Check if port 8000 is available
def check_port(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("localhost", port))
        available = True
    except socket.error:
        available = False
    finally:
        s.close()
    return available

port = 8000
log(f"Checking if port {port} is available: {check_port(port)}")
if not check_port(port):
    log(f"WARNING: Port {port} is already in use. This might prevent Django server from starting.")

# Set up Django environment
try:
    log("Setting up Django environment...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
    log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    django.setup()
    log("Django setup completed successfully")
    from django.conf import settings
except Exception as e:
    log(f"ERROR setting up Django: {str(e)}")
    traceback.print_exc()
    with open(log_file, 'a') as f:
        traceback.print_exc(file=f)
    sys.exit(1)

# Print Django version and settings information
log(f"Django version: {django.get_version()}")
log(f"DEBUG: {settings.DEBUG}")
log(f"STATIC_URL: {settings.STATIC_URL}")
log(f"STATIC_ROOT: {settings.STATIC_ROOT}")
log(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
log(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")

# Check if static directories exist
log("\nChecking static directories:")
for static_dir in settings.STATICFILES_DIRS:
    log(f"Directory {static_dir} exists: {os.path.exists(static_dir)}")

# Check if STATIC_ROOT exists
log(f"STATIC_ROOT directory exists: {os.path.exists(settings.STATIC_ROOT)}")

# Check INSTALLED_APPS
log("\nINSTALLED_APPS:")
for app in settings.INSTALLED_APPS:
    log(f"  - {app}")

# Check REST_FRAMEWORK settings
log("\nREST_FRAMEWORK settings:")
if hasattr(settings, 'REST_FRAMEWORK'):
    for key, value in settings.REST_FRAMEWORK.items():
        log(f"  {key}: {value}")
else:
    log("  No REST_FRAMEWORK settings found")

# Check if django-filter is installed
log("\nChecking required packages:")
try:
    import django_filters
    log(f"django-filter is installed: {django_filters.__version__}")
except ImportError:
    log("django-filter is NOT installed")

# Try to import the website module and its components
log("\nChecking website module:")
try:
    import website
    log(f"website module found: {website.__file__}")
    
    # Check key modules in website app
    modules_to_check = ['models', 'views', 'api_views', 'urls']
    for module_name in modules_to_check:
        try:
            full_module_name = f'website.{module_name}'
            module = __import__(full_module_name, fromlist=[''])
            log(f"  ✓ {full_module_name} - {module.__file__}")
            
            # If this is api_views, check its contents
            if module_name == 'api_views':
                log("    Examining api_views module content:")
                for item_name in dir(module):
                    if not item_name.startswith('__'):
                        log(f"      - {item_name}")
        except ImportError as e:
            log(f"  ✗ {full_module_name} - ERROR: {str(e)}")
        except Exception as e:
            log(f"  ✗ {full_module_name} - EXCEPTION: {str(e)}")
            with open(log_file, 'a') as f:
                traceback.print_exc(file=f)
except ImportError as e:
    log(f"website module not found: {str(e)}")
except Exception as e:
    log(f"Error checking website module: {str(e)}")
    with open(log_file, 'a') as f:
        traceback.print_exc(file=f)

# Print Python path
log("\nPython path:")
for path in sys.path:
    log(f"  {path}")

# Try to run a simple Django command
log("\nTrying to run 'python manage.py check'...")
try:
    import subprocess
    result = subprocess.run(
        [sys.executable, 'manage.py', 'check'], 
        capture_output=True, 
        text=True,
        timeout=30
    )
    log(f"Exit code: {result.returncode}")
    log(f"Output:\n{result.stdout}")
    if result.stderr:
        log(f"Errors:\n{result.stderr}")
except subprocess.TimeoutExpired:
    log("Command timed out after 30 seconds")
except Exception as e:
    log(f"Error running Django check command: {str(e)}")

log("\nDiagnostic complete. Check the log file for details: " + log_file)