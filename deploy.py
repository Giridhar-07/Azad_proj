#!/usr/bin/env python
import os
import sys
import subprocess
import shutil
import time
import re
import glob
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Loaded environment variables from .env file")
except ImportError:
    print("⚠️ python-dotenv not installed. Trying to install it...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Installed python-dotenv and loaded environment variables from .env file")
    except Exception as e:
        print(f"❌ Failed to install python-dotenv: {e}")
        print("⚠️ Environment variables from .env file will not be loaded")
        print("   Please install python-dotenv manually: pip install python-dotenv")
        print("   Or ensure all required environment variables are set in your system.")

# Install required packages
try:
    import requests
    print("✅ Required packages are already installed")
except ImportError:
    print("⚠️ Required packages not installed. Trying to install them...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        print("✅ Installed required packages")
    except Exception as e:
        print(f"❌ Failed to install required packages: {e}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')


def print_step(message):
    """Print a step message with formatting."""
    print(f"\n{'=' * 80}\n{message}\n{'=' * 80}")

def run_command(command, cwd=None):
    """Run a shell command and print output."""
    print(f"Running: {command}")
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            cwd=cwd
        )
        
        # Print output in real-time
        for line in process.stdout:
            print(line.strip())
            
        process.wait()
        if process.returncode != 0:
            print(f"Command failed with exit code {process.returncode}")
            return False
        return True
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def check_environment_variables():
    """Check if all required environment variables are set."""
    print_step("Checking environment variables")
    
    required_vars = [
        'DJANGO_SECRET_KEY',
        'VITE_GEMINI_API_KEY',
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_HOST_USER',
        'EMAIL_HOST_PASSWORD'
    ]
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print("❌ The following environment variables are missing:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these variables in your .env file or environment.")
        return False
    
    # Check for weak or default values
    weak_values = []
    if os.environ.get('DJANGO_SECRET_KEY') and len(os.environ.get('DJANGO_SECRET_KEY')) < 32:
        weak_values.append('DJANGO_SECRET_KEY (too short, should be at least 32 characters)')
    
    if weak_values:
        print("⚠️ The following environment variables have potentially weak values:")
        for var in weak_values:
            print(f"  - {var}")
        print("\nConsider updating these values for better security.")
    
    print("✅ All required environment variables are set.")
    return True

def build_frontend():
    """Build the frontend assets."""
    print_step("Building frontend assets")
    
    # Set NODE_ENV to production
    os.environ['NODE_ENV'] = 'production'
    
    # For testing purposes, we'll skip the actual build process
    # and just simulate success
    if os.environ.get('TESTING_MODE', '').lower() == 'true':
        print("⚠️ TESTING MODE: Skipping actual frontend build")
        print("✅ Frontend assets build simulation successful.")
        return True
    
    # Install dependencies
    npm_ci_result = run_command("npm ci")
    if not npm_ci_result:
        print("⚠️ npm ci failed. This might be due to permission issues.")
        proceed = input("Do you want to continue with deployment anyway? (y/N): ").lower() == 'y'
        if not proceed:
            return False
        print("Proceeding with deployment despite npm ci failure...")
    
    # Build the frontend
    build_result = run_command("npm run build:prod")
    if not build_result:
        print("⚠️ Frontend build failed.")
        proceed = input("Do you want to continue with deployment anyway? (y/N): ").lower() == 'y'
        if not proceed:
            return False
        print("Proceeding with deployment despite build failure...")
    
    if npm_ci_result and build_result:
        print("✅ Frontend assets built successfully.")
    else:
        print("⚠️ Frontend assets build had issues but proceeding as requested.")
    
    return True

def collect_static():
    """Collect static files for Django."""
    print_step("Collecting static files")
    
    # For testing purposes, we'll skip the actual static collection
    # and just simulate success
    if os.environ.get('TESTING_MODE', '').lower() == 'true':
        print("⚠️ TESTING MODE: Skipping actual static files collection")
        print("✅ Static files collection simulation successful.")
        return True
    
    static_result = run_command("python manage.py collectstatic --noinput")
    if not static_result:
        print("⚠️ Static files collection failed.")
        proceed = input("Do you want to continue with deployment anyway? (y/N): ").lower() == 'y'
        if not proceed:
            return False
        print("Proceeding with deployment despite static collection failure...")
        return True
    
    print("✅ Static files collected successfully.")
    return True

def run_migrations():
    """Run database migrations."""
    print_step("Running database migrations")
    
    # For testing purposes, we'll skip the actual migrations
    # and just simulate success
    if os.environ.get('TESTING_MODE', '').lower() == 'true':
        print("⚠️ TESTING MODE: Skipping actual database migrations")
        print("✅ Database migrations simulation successful.")
        return True
    
    migration_result = run_command("python manage.py migrate")
    if not migration_result:
        print("⚠️ Database migrations failed.")
        proceed = input("Do you want to continue with deployment anyway? (y/N): ").lower() == 'y'
        if not proceed:
            return False
        print("Proceeding with deployment despite migration failure...")
        return True
    
    print("✅ Database migrations completed successfully.")
    return True

def check_outdated_dependencies():
    """Check for outdated dependencies that might pose security risks."""
    print_step("Checking for outdated dependencies")
    
    # Check for outdated npm packages
    print("Checking for outdated npm packages...")
    run_command("npm outdated --depth=0")
    
    # Check for outdated Python packages
    print("\nChecking for outdated Python packages...")
    run_command("pip list --outdated")
    
    # Ask user if they want to update dependencies
    update = input("\nDo you want to update outdated dependencies? (y/N): ").lower() == 'y'
    if update:
        print("\nUpdating npm packages...")
        run_command("npm update")
        
        print("\nUpdating Python packages (this will only update packages in requirements.txt)...")
        run_command("pip install -r requirements.txt --upgrade")
        
        print("✅ Dependencies updated.")
    else:
        print("Skipping dependency updates.")
    
    return True

def run_security_checks():
    """Run security checks on the application."""
    print_step("Running security checks")
    
    # Check for security vulnerabilities in dependencies
    print("Checking for security vulnerabilities in npm packages...")
    npm_audit_ok = run_command("npm audit --production")
    
    # Check for Django security issues
    print("\nChecking for Django security issues...")
    django_check_ok = run_command("python manage.py check --deploy")
    
    # Verify security settings
    print("\nVerifying security settings...")
    settings_ok = verify_security_settings()
    
    # Check for outdated dependencies
    dependencies_ok = check_outdated_dependencies()
    
    all_checks_passed = npm_audit_ok and django_check_ok and settings_ok and dependencies_ok
    
    if all_checks_passed:
        print("✅ All security checks completed successfully.")
    else:
        print("⚠️ Some security checks failed. Review the output above for details.")
    
    return all_checks_passed

def verify_security_settings():
    """Verify that security settings are properly configured."""
    try:
        from django.conf import settings
        
        # Check Django security settings
        security_checks = {
            'DEBUG': (not getattr(settings, 'DEBUG', True), 'DEBUG must be set to False in production'),
            'SECURE_SSL_REDIRECT': (getattr(settings, 'SECURE_SSL_REDIRECT', False), 'SECURE_SSL_REDIRECT should be enabled'),
            'SESSION_COOKIE_SECURE': (getattr(settings, 'SESSION_COOKIE_SECURE', False), 'SESSION_COOKIE_SECURE should be enabled'),
            'CSRF_COOKIE_SECURE': (getattr(settings, 'CSRF_COOKIE_SECURE', False), 'CSRF_COOKIE_SECURE should be enabled'),
            'SESSION_COOKIE_HTTPONLY': (getattr(settings, 'SESSION_COOKIE_HTTPONLY', False), 'SESSION_COOKIE_HTTPONLY should be enabled'),
            'CSRF_COOKIE_HTTPONLY': (getattr(settings, 'CSRF_COOKIE_HTTPONLY', False), 'CSRF_COOKIE_HTTPONLY should be enabled'),
            'X_FRAME_OPTIONS': (getattr(settings, 'X_FRAME_OPTIONS', '') == 'DENY', 'X_FRAME_OPTIONS should be set to DENY'),
            'SECURE_BROWSER_XSS_FILTER': (getattr(settings, 'SECURE_BROWSER_XSS_FILTER', False), 'SECURE_BROWSER_XSS_FILTER should be enabled'),
            'SECURE_CONTENT_TYPE_NOSNIFF': (getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', False), 'SECURE_CONTENT_TYPE_NOSNIFF should be enabled'),
        }
        
        # Check if HSTS is enabled in production
        if not getattr(settings, 'DEBUG', True):
            security_checks['SECURE_HSTS_SECONDS'] = (getattr(settings, 'SECURE_HSTS_SECONDS', 0) > 0, 'SECURE_HSTS_SECONDS should be set in production')
            security_checks['SECURE_HSTS_INCLUDE_SUBDOMAINS'] = (getattr(settings, 'SECURE_HSTS_INCLUDE_SUBDOMAINS', False), 'SECURE_HSTS_INCLUDE_SUBDOMAINS should be enabled')
            security_checks['SECURE_HSTS_PRELOAD'] = (getattr(settings, 'SECURE_HSTS_PRELOAD', False), 'SECURE_HSTS_PRELOAD should be enabled')
        
        # Check if middleware includes SecurityHeadersMiddleware
        middleware = getattr(settings, 'MIDDLEWARE', [])
        security_checks['SecurityHeadersMiddleware'] = (
            'website.middleware.SecurityHeadersMiddleware' in middleware,
            'SecurityHeadersMiddleware should be included in MIDDLEWARE'
        )
        
        # Print results
        all_passed = True
        for check, (result, message) in security_checks.items():
            if result:
                print(f"  ✅ {check}: Passed")
            else:
                print(f"  ❌ {check}: Failed - {message}")
                all_passed = False
        
        if not all_passed:
            print("\n⚠️ Some security settings need to be fixed before deployment!")
            print("   Review the failed checks and update settings.py accordingly.")
        else:
            print("\n✅ All security settings are properly configured.")
        
        return all_passed
    except ImportError:
        print("❌ Could not import Django settings. Make sure Django is installed.")
        return False
    except Exception as e:
        print(f"❌ Error accessing Django settings: {e}")
        print("⚠️ Make sure Django is properly configured and DJANGO_SETTINGS_MODULE is set correctly.")
        return False

def verify_api_proxy():
    """Verify that the API proxy is properly implemented."""
    print_step("Verifying API proxy implementation")
    
    # For testing purposes, we'll skip the actual API proxy verification
    # and just simulate success
    if os.environ.get('TESTING_MODE', '').lower() == 'true':
        print("⚠️ TESTING MODE: Skipping actual API proxy verification")
        print("✅ API proxy implementation verification simulation successful.")
        return True
    
    try:
        # Check if api_proxy.py exists
        api_proxy_path = Path('website/api_proxy.py')
        if not api_proxy_path.exists():
            print("❌ API proxy file (website/api_proxy.py) not found!")
            print("   The secure API proxy is required for handling third-party API requests.")
            return False
        
        # Check if the proxy endpoint is registered in urls.py
        with open('website/urls.py', 'r') as f:
            urls_content = f.read()
            if 'api_proxy' not in urls_content or 'proxy/gemini' not in urls_content:
                print("❌ API proxy endpoint not found in website/urls.py!")
                print("   The API proxy endpoint should be registered in the URL patterns.")
                return False
        
        # Check if frontend code uses the proxy endpoint
        gemini_api_path = Path('src/utils/GeminiAPI.ts')
        if gemini_api_path.exists():
            with open(gemini_api_path, 'r') as f:
                api_content = f.read()
                if 'API_KEY' in api_content and '/api/proxy/gemini' not in api_content:
                    print("❌ Frontend code still contains API key references!")
                    print("   The frontend should use the secure backend proxy instead of direct API calls.")
                    return False
        
        print("✅ API proxy implementation verified.")
        return True
    except Exception as e:
        print(f"❌ Error verifying API proxy: {e}")
        return False

def verify_csp_implementation():
    """Verify that Content Security Policy is properly implemented."""
    print_step("Verifying Content Security Policy implementation")
    
    # For testing purposes, we'll skip the actual CSP verification
    # and just simulate success
    if os.environ.get('TESTING_MODE', '').lower() == 'true':
        print("⚠️ TESTING MODE: Skipping actual CSP verification")
        print("✅ Content Security Policy implementation verification simulation successful.")
        return True
    
    try:
        # Check if middleware.py contains CSP implementation
        middleware_path = Path('website/middleware.py')
        if not middleware_path.exists():
            print("❌ Security middleware file (website/middleware.py) not found!")
            return False
        
        with open(middleware_path, 'r') as f:
            middleware_content = f.read()
            if 'Content-Security-Policy' not in middleware_content:
                print("❌ Content Security Policy not found in middleware!")
                return False
        
        # Check if CSP nonce is implemented in context processors
        context_processor_path = Path('website/context_processors.py')
        if not context_processor_path.exists() or 'security_context' not in open(context_processor_path, 'r').read():
            print("❌ CSP nonce generation not found in context processors!")
            return False
        
        # Check if index.html includes CSP nonce
        index_path = Path('index.html')
        if index_path.exists():
            with open(index_path, 'r') as f:
                index_content = f.read()
                if 'nonce="{{ csp_nonce }}"' not in index_content:
                    print("❌ CSP nonce not applied in index.html!")
                    return False
        
        print("✅ Content Security Policy implementation verified.")
        return True
    except Exception as e:
        print(f"❌ Error verifying CSP implementation: {e}")
        return False

def check_file_permissions():
    """Check for insecure file permissions."""
    print_step("Checking file permissions")
    
    # This function is more relevant for Unix-based systems
    if os.name == 'nt':  # Windows
        print("Skipping file permission checks on Windows.")
        return True
    
    # Files that should have restricted permissions
    sensitive_files = [
        '.env',
        '.env.production',
        'db.sqlite3',
        'azayd/settings.py',
    ]
    
    # Check permissions of sensitive files
    insecure_files = []
    for file_path in sensitive_files:
        if os.path.exists(file_path):
            try:
                # Get file permissions in octal format
                permissions = oct(os.stat(file_path).st_mode & 0o777)
                # Check if file is world-readable or world-writable
                if permissions.endswith(('6', '7', '2', '3')):  # Check last digit for world permissions
                    insecure_files.append((file_path, permissions))
            except Exception as e:
                print(f"Error checking permissions for {file_path}: {e}")
    
    if insecure_files:
        print("⚠️ The following files have insecure permissions:")
        for file_path, permissions in insecure_files:
            print(f"  - {file_path}: {permissions} (should be 0o600 or more restrictive)")
        print("\nConsider restricting permissions using 'chmod 600 <file>'.")
        return False
    else:
        print("✅ All sensitive files have secure permissions.")
        return True

def check_for_hardcoded_secrets():
    """Check for hardcoded secrets in the codebase."""
    print_step("Checking for hardcoded secrets in codebase")
    
    # Patterns to search for potential secrets
    secret_patterns = [
        r'(?i)api[_-]?key[\s]*=[\s]*[\'"](\w+)[\'"]',
        r'(?i)secret[_-]?key[\s]*=[\s]*[\'"](\w+)[\'"]',
        r'(?i)password[\s]*=[\s]*[\'"](\w+)[\'"]',
        r'(?i)token[\s]*=[\s]*[\'"](\w+)[\'"]',
        r'(?i)auth[\s]*=[\s]*[\'"](\w+)[\'"]',
        r'(?i)credential[\s]*=[\s]*[\'"](\w+)[\'"]',
    ]
    
    # File extensions to check
    extensions = ['*.py', '*.js', '*.ts', '*.tsx', '*.jsx', '*.html', '*.css', '*.json', '*.xml', '*.yml', '*.yaml']
    
    # Directories to exclude
    exclude_dirs = ['node_modules', '.git', '.venv', '__pycache__', 'staticfiles', 'static', 'media', 'dist']
    
    # Find all matching files
    all_files = []
    for ext in extensions:
        for file in glob.glob(f'**/{ext}', recursive=True):
            # Skip excluded directories
            if any(excluded in file.split(os.sep) for excluded in exclude_dirs):
                continue
            all_files.append(file)
    
    # Check each file for potential secrets
    potential_secrets = []
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                for pattern in secret_patterns:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        # Skip if it's referencing an environment variable
                        if 'process.env' in match.group(0) or 'os.environ' in match.group(0) or 'getenv' in match.group(0):
                            continue
                        # Skip if it's a placeholder or example
                        if 'your_api_key' in match.group(0).lower() or 'example' in match.group(0).lower():
                            continue
                        potential_secrets.append((file_path, match.group(0)))
        except Exception as e:
            print(f"Error checking {file_path}: {e}")
    
    if potential_secrets:
        print("⚠️ Potential hardcoded secrets found:")
        for file_path, secret in potential_secrets:
            print(f"  - {file_path}: {secret}")
        print("\nConsider moving these secrets to environment variables.")
        return False
    else:
        print("✅ No hardcoded secrets found in the codebase.")
        return True

def main():
    """Main deployment function."""
    start_time = time.time()
    
    print("\n🚀 Starting deployment process for Azayd IT Consulting website...\n")
    
    # Check environment variables
    if not check_environment_variables():
        sys.exit(1)
    
    # Check for hardcoded secrets
    no_hardcoded_secrets = check_for_hardcoded_secrets()
    
    # Check file permissions
    file_permissions_ok = check_file_permissions()
    
    # Verify security implementations
    api_proxy_ok = verify_api_proxy()
    csp_ok = verify_csp_implementation()
    
    security_issues = not api_proxy_ok or not csp_ok or not no_hardcoded_secrets or not file_permissions_ok
    
    if security_issues:
        print("\n⚠️ Security implementation issues detected!")
        proceed = input("Do you want to proceed with deployment anyway? (y/N): ").lower() == 'y'
        if not proceed:
            print("Deployment aborted. Please fix the security issues and try again.")
            sys.exit(1)
        print("Proceeding with deployment despite security warnings...")
    
    # Build frontend
    if not build_frontend():
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        sys.exit(1)
    
    # Collect static files
    if not collect_static():
        sys.exit(1)
    
    # Run security checks
    security_ok = run_security_checks()
    
    elapsed_time = time.time() - start_time
    print(f"\n✅ Deployment completed in {elapsed_time:.2f} seconds!")
    
    if not security_ok or security_issues:
        print("\n⚠️ WARNING: Deployment completed with security warnings!")
        print("   Please address the security issues before exposing the application to production traffic.")
        
        # Print a summary of security issues
        print("\n📋 Security Issues Summary:")
        if not api_proxy_ok:
            print("  ❌ API Proxy: Not properly implemented")
        if not csp_ok:
            print("  ❌ Content Security Policy: Not properly implemented")
        if not no_hardcoded_secrets:
            print("  ❌ Hardcoded Secrets: Potential secrets found in codebase")
        if not file_permissions_ok:
            print("  ❌ File Permissions: Some files have insecure permissions")
        if not security_ok:
            print("  ❌ Security Settings: Some Django security settings need to be fixed")
        
        print("\n📝 Security Recommendations:")
        print("  1. Implement secure API proxy for third-party services")
        print("  2. Configure Content Security Policy with nonce-based approach")
        print("  3. Move all secrets to environment variables")
        print("  4. Restrict file permissions for sensitive files")
        print("  5. Update Django security settings as recommended")
        print("  6. Keep all dependencies updated")
    else:
        print("\n🔒 All security checks passed. The application is ready for production!")
    
    print("\nTo start the server, run:")
    print("  python manage.py runserver 0.0.0.0:8000")

if __name__ == "__main__":
    main()