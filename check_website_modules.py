import os
import sys
import importlib
import traceback

# Set up logging
log_file = 'website_modules_check.log'
with open(log_file, 'w') as f:
    f.write("=== Website Modules Check ===\n\n")

def log(message):
    """Write to both console and log file"""
    print(message)
    with open(log_file, 'a') as f:
        f.write(f"{message}\n")

log("Starting website modules check...")

# Set Django settings module but don't initialize Django yet
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
log(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

# Check if we can import Django
try:
    import django
    log(f"Django version: {django.get_version()}")
except ImportError as e:
    log(f"ERROR importing Django: {str(e)}")
    sys.exit(1)

# Check if the website package exists
log("\nChecking if website package exists...")
try:
    import website
    log(f"website package found at: {website.__file__}")
except ImportError as e:
    log(f"ERROR importing website package: {str(e)}")
    sys.exit(1)

# Check each module individually without initializing Django
modules_to_check = [
    'website.models', 
    'website.views', 
    'website.api_views',
    'website.urls',
    'website.admin'
]

log("\nChecking individual modules without Django initialization...")
for module_name in modules_to_check:
    log(f"\nChecking {module_name}...")
    try:
        # Use __import__ to avoid importing submodules
        module = __import__(module_name, fromlist=[''])
        log(f"Successfully imported {module_name} from {module.__file__}")
        
        # Check for common issues in the module
        log(f"Examining {module_name} content:")
        
        # Check for potentially problematic imports
        with open(module.__file__, 'r') as f:
            content = f.read()
            
            # Check for imports that might cause issues
            problematic_imports = [
                'import django.db.models.signals',
                'from django.db.models.signals',
                'post_save',
                'pre_save',
                'post_delete',
                'pre_delete',
                'import threading',
                'import multiprocessing',
                '@receiver',
                'apps.get_model',
                'apps.get_app_config',
                'django.apps',
                'django.setup',
                'settings.configure',
                'django.conf.settings.configure'
            ]
            
            for imp in problematic_imports:
                if imp in content:
                    log(f"  - WARNING: Potentially problematic import/usage found: {imp}")
            
            # Check for model signals
            if 'models.py' in module.__file__:
                if 'signals' in content or 'receiver' in content:
                    log("  - WARNING: Model signals detected which might cause initialization issues")
            
            # Check for app ready method overrides
            if 'apps.py' in module.__file__:
                if 'def ready' in content:
                    log("  - WARNING: AppConfig.ready() method override detected")
                    
            # Check for custom middleware
            if 'middleware' in content:
                log("  - INFO: Custom middleware detected")
                
            # Check for REST framework viewsets
            if 'api_views.py' in module.__file__:
                if 'ModelViewSet' in content:
                    log("  - INFO: REST framework ModelViewSet detected")
                if 'get_queryset' in content:
                    log("  - INFO: Custom get_queryset method detected")
                    
    except ImportError as e:
        log(f"ERROR importing {module_name}: {str(e)}")
    except Exception as e:
        log(f"ERROR examining {module_name}: {str(e)}")
        traceback.print_exc()

# Try to import django_filters separately
log("\nChecking django_filters...")
try:
    import django_filters
    log(f"django_filters version: {django_filters.__version__}")
except ImportError as e:
    log(f"ERROR importing django_filters: {str(e)}")
except Exception as e:
    log(f"ERROR with django_filters: {str(e)}")
    traceback.print_exc()

# Check for circular imports
log("\nChecking for potential circular imports...")
try:
    import website
    website_dir = os.path.dirname(website.__file__)
    py_files = [f for f in os.listdir(website_dir) if f.endswith('.py')]
    
    for file1 in py_files:
        file1_path = os.path.join(website_dir, file1)
        with open(file1_path, 'r') as f:
            content1 = f.read()
            
            for file2 in py_files:
                if file1 != file2:
                    # Check if file1 imports from file2
                    module_name2 = file2[:-3]  # Remove .py extension
                    if f"import {module_name2}" in content1 or f"from {module_name2} import" in content1:
                        # Now check if file2 imports from file1
                        file2_path = os.path.join(website_dir, file2)
                        with open(file2_path, 'r') as f2:
                            content2 = f2.read()
                            module_name1 = file1[:-3]  # Remove .py extension
                            if f"import {module_name1}" in content2 or f"from {module_name1} import" in content2:
                                log(f"  - WARNING: Potential circular import between {file1} and {file2}")
except Exception as e:
    log(f"ERROR checking for circular imports: {str(e)}")
    traceback.print_exc()

log("\nCheck complete. See log file for details: " + log_file)