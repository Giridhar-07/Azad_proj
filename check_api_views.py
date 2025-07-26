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

try:
    print("Attempting to import website.api_views...")
    import website.api_views
    print("Successfully imported website.api_views")
except ImportError as e:
    print(f"Error importing website.api_views: {e}")
    print("\nPython path:")
    for path in sys.path:
        print(f"  - {path}")

print("Script completed.")