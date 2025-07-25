import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
django.setup()

# Print Django version and settings information
print(f"Django version: {django.get_version()}")
print(f"DEBUG: {settings.DEBUG}")
print(f"STATIC_URL: {settings.STATIC_URL}")
print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
print(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")

# Check if static directories exist
for static_dir in settings.STATICFILES_DIRS:
    print(f"Directory {static_dir} exists: {os.path.exists(static_dir)}")

# Check if STATIC_ROOT exists
print(f"STATIC_ROOT directory exists: {os.path.exists(settings.STATIC_ROOT)}")

# Check if django-filter is installed
try:
    import django_filters
    print(f"django-filter is installed: {django_filters.__version__}")
except ImportError:
    print("django-filter is NOT installed")

# Try to import the website.api_views module
try:
    from website import api_views
    print("Successfully imported website.api_views")
except ImportError as e:
    print(f"Error importing website.api_views: {e}")

# Print Python path
print("\nPython path:")
for path in sys.path:
    print(f"  {path}")