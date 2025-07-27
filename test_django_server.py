import os
import sys
import traceback

print("Starting script...")

try:
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
    print("Django initialized successfully.")

    # Import the WSGI application
    print("Importing WSGI application...")
    from django.core.wsgi import get_wsgi_application
    from django.core.management import call_command
    print("WSGI application imported successfully.")

    # Check if django_filters is installed
    print("\nChecking for django_filters...")
    try:
        import django_filters
        print(f"django_filters is installed: {django_filters.__version__}")
    except ImportError as e:
        print(f"Error importing django_filters: {e}")

    # Check if website.api_views can be imported
    print("\nChecking for website.api_views...")
    try:
        import website.api_views
        print("website.api_views imported successfully")
    except ImportError as e:
        print(f"Error importing website.api_views: {e}")

    # Try to run the server
    print("\nStarting Django development server...")
    call_command('runserver', '8000', '--noreload', verbosity=3)

except Exception as e:
    print(f"\nError: {e}")
    traceback.print_exc()

print("\nScript completed.")