try:
    import django_filters
    print(f"django-filter is installed: {django_filters.__version__}")
except ImportError as e:
    print(f"Error importing django-filter: {e}")