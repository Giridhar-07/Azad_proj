import os
import sys
import time
import traceback

# Create a log file
log_file = 'django_init_debug.log'
with open(log_file, 'w') as f:
    f.write(f"=== Django Initialization Debug: {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting Django initialization debug...")

# Step 1: Check Python environment
log(f"Python version: {sys.version}")
log(f"Python executable: {sys.executable}")
log(f"Current working directory: {os.getcwd()}")

# Step 2: Set up Django settings module
try:
    log("Setting DJANGO_SETTINGS_MODULE environment variable...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
    log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
except Exception as e:
    log(f"ERROR setting DJANGO_SETTINGS_MODULE: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Step 3: Import Django
try:
    log("Importing Django...")
    import django
    log(f"Django version: {django.get_version()}")
except Exception as e:
    log(f"ERROR importing Django: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Step 4: Initialize Django (with threading-based timeout for Windows)
try:
    log("Initializing Django (django.setup())...")
    log("This step might hang if there are issues with the Django configuration.")
    
    # Use threading for timeout (works on Windows)
    import threading
    import subprocess
    
    # Create a separate Python process to run django.setup()
    log("Creating a separate process to run django.setup() with timeout...")
    
    # Create a simple script to run django.setup()
    setup_script = "django_setup_test.py"
    with open(setup_script, 'w') as f:
        f.write("""
import os
import sys
import django
import traceback

try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
    print("Setting up Django...")
    django.setup()
    print("Django setup completed successfully")
    from django.conf import settings
    print(f"INSTALLED_APPS: {', '.join(settings.INSTALLED_APPS)}")
except Exception as e:
    print(f"ERROR: {str(e)}")
    traceback.print_exc()
    sys.exit(1)
""")
    
    # Run the script with a timeout
    try:
        log(f"Running {setup_script} with 10 second timeout...")
        result = subprocess.run(
            [sys.executable, setup_script],
            capture_output=True,
            text=True,
            timeout=10  # 10 second timeout
        )
        
        # Process the result
        log(f"Process exit code: {result.returncode}")
        if result.stdout:
            log(f"Output:\n{result.stdout}")
        if result.stderr:
            log(f"Errors:\n{result.stderr}")
            
        if result.returncode == 0:
            log("Django setup completed successfully in the subprocess")
        else:
            log(f"Django setup failed with exit code {result.returncode}")
            
    except subprocess.TimeoutExpired:
        log("TIMEOUT: Django setup process took longer than 10 seconds and was terminated")
        log("This indicates Django is getting stuck during initialization")
        log("Possible causes: infinite loop in app initialization, deadlock, or resource issue")
    except Exception as e:
        log(f"ERROR running Django setup process: {str(e)}")
        traceback.print_exc()
        with open(log_file, 'a') as f:
            traceback.print_exc(file=f)
    
    # Clean up the temporary script
    try:
        os.remove(setup_script)
    except:
        pass
    
    # Step 5: Try to import settings
    try:
        log("Importing Django settings...")
        from django.conf import settings
        log("Django settings imported successfully")
        
        # Print some basic settings
        log(f"DEBUG: {settings.DEBUG}")
        log(f"INSTALLED_APPS: {', '.join(settings.INSTALLED_APPS)}")
    except Exception as e:
        log(f"ERROR importing Django settings: {str(e)}")
        traceback.print_exc()

except Exception as e:
    log(f"ERROR during Django initialization: {str(e)}")
    traceback.print_exc()

log("\nDebug complete. Check the log file for details: " + log_file)