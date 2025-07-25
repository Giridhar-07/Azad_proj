import smtplib
import sys
import traceback

# Email configuration
smtp_server = 'smtp.gmail.com'
port = 587
sender_email = 'azayd8752@gmail.com'
password = 'ajjk wkxk parm wpeu'  # App password from .env file

# Force output to be unbuffered
sys.stdout = open('smtp_test_output.txt', 'w', buffering=1)

try:
    # Create a secure connection with the server
    print(f"Connecting to {smtp_server}:{port}...")
    server = smtplib.SMTP(smtp_server, port)
    server.set_debuglevel(2)  # Enable maximum debug output
    
    # Start TLS encryption
    print("Starting TLS...")
    server.starttls()
    
    # Login to the email server
    print(f"Logging in as {sender_email}...")
    server.login(sender_email, password)
    print("Login successful!")
    
    # Try to send a test email
    print("Attempting to send a test email...")
    message = f"""From: {sender_email}
To: test@example.com
Subject: SMTP Test

This is a test email sent from Python."""
    server.sendmail(sender_email, ["test@example.com"], message)
    print("Test email sent successfully!")
    
    # Close the connection
    server.quit()
    print("Connection closed.")
    
except Exception as e:
    print(f"Error: {str(e)}")
    print("\nDetailed traceback:")
    traceback.print_exc()

# Close the output file
sys.stdout.close()
# Restore stdout
sys.stdout = sys.__stdout__
print("Test completed. Check smtp_test_output.txt for details.")