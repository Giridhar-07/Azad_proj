import os
import sys

print("Starting script...")

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
print(f"DJANGO_SETTINGS_MODULE set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)
print(f"Project directory: {project_dir}")

# Initialize Django
print("Initializing Django...")
import django
django.setup()
print("Django initialized.")

# Check if website module exists
print("\nChecking for website module...")
try:
    import website
    print(f"website module found at: {website.__file__}")
    
    # Try to import specific modules
    print("\nTrying to import specific modules:")
    try:
        import website.models
        print("- website.models imported successfully")
    except ImportError as e:
        print(f"- Error importing website.models: {e}")
    
    try:
        import website.views
        print("- website.views imported successfully")
    except ImportError as e:
        print(f"- Error importing website.views: {e}")
    
    try:
        import website.api_views
        print("- website.api_views imported successfully")
    except ImportError as e:
        print(f"- Error importing website.api_views: {e}")
        
except ImportError as e:
    print(f"Error importing website module: {e}")
    
    # Check if the website directory exists
    website_dir = os.path.join(project_dir, 'website')
    if os.path.exists(website_dir):
        print(f"website directory exists at: {website_dir}")
        print("Contents:")
        for item in os.listdir(website_dir):
            print(f"  - {item}")
    else:
        print(f"website directory does not exist at: {website_dir}")

print("\nScript completed.")