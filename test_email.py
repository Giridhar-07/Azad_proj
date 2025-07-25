import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'azayd.settings')
django.setup()

# Import necessary modules
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import datetime

# Test email sending
def test_email_sending():
    try:
        # Prepare context for email template
        context = {
            'name': 'Test User',
            'job_title': 'Test Position',
            'submitted_at': datetime.datetime.now().strftime('%B %d, %Y'),
            'resume_file': True,
            'resume_link': False,
            'current_year': datetime.datetime.now().year
        }
        
        # Render email templates
        html_content = render_to_string('emails/job_application_confirmation.html', context)
        text_content = render_to_string('emails/job_application_confirmation.txt', context)
        
        # Create email
        subject = f'Test: Application Received for {context["job_title"]}'
        email = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            ['test@example.com']
        )
        email.attach_alternative(html_content, "text/html")
        
        # Print email settings for debugging
        print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
        print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
        print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
        print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        
        # Send email
        email.send()
        print("Email sent successfully!")
        
    except Exception as e:
        import traceback
        print(f"Error sending email: {str(e)}")
        print("\nDetailed traceback:")
        traceback.print_exc()
        
        # Check if it's an SMTP-related error
        if 'SMTP' in str(e):
            print("\nSMTP Error detected. Checking email settings...")
            # Print more detailed email settings
            print(f"EMAIL_HOST_PASSWORD is {'set' if settings.EMAIL_HOST_PASSWORD else 'NOT set'}")
            if not settings.EMAIL_HOST_PASSWORD:
                print("WARNING: EMAIL_HOST_PASSWORD is empty or not set!")
            
            # Try to connect to SMTP server directly
            try:
                import smtplib
                print(f"\nAttempting to connect to SMTP server {settings.EMAIL_HOST}:{settings.EMAIL_PORT}...")
                server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
                server.set_debuglevel(1)  # Enable verbose debug output
                server.ehlo()
                if settings.EMAIL_USE_TLS:
                    server.starttls()
                    server.ehlo()
                print("SMTP connection successful!")
                
                # Try to authenticate
                try:
                    print(f"Attempting to authenticate as {settings.EMAIL_HOST_USER}...")
                    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                    print("Authentication successful!")
                except Exception as auth_error:
                    print(f"Authentication failed: {str(auth_error)}")
                
                server.quit()
            except Exception as smtp_error:
                print(f"SMTP connection failed: {str(smtp_error)}")
        
        # Check if it's a template-related error
        if 'template' in str(e).lower() or 'render' in str(e).lower():
            print("\nTemplate Error detected. Checking template paths...")
            from django.template.loaders.app_directories import get_app_template_dirs
            template_dirs = get_app_template_dirs('templates')
            print("Template directories:")
            for template_dir in template_dirs:
                print(f"  - {template_dir}")
                
            # Check if the specific template exists
            import os
            for template_dir in template_dirs:
                html_path = os.path.join(template_dir, 'emails', 'job_application_confirmation.html')
                txt_path = os.path.join(template_dir, 'emails', 'job_application_confirmation.txt')
                print(f"Checking {html_path}: {'EXISTS' if os.path.exists(html_path) else 'NOT FOUND'}")
                print(f"Checking {txt_path}: {'EXISTS' if os.path.exists(txt_path) else 'NOT FOUND'}")


if __name__ == '__main__':
    # Redirect stdout to a file
    with open('email_test_output.log', 'w') as f:
        # Save original stdout
        original_stdout = sys.stdout
        # Set stdout to the file
        sys.stdout = f
        
        try:
            test_email_sending()
        finally:
            # Restore stdout
            sys.stdout = original_stdout
    
    # Print a message to the console
    print("Test completed. Check email_test_output.log for details.")