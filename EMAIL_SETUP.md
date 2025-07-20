# Email Configuration Guide

## Current Status

The job application confirmation email system is currently configured to use SMTP with Gmail, but it will automatically fall back to console output if SMTP authentication fails. This means:

1. When a user submits a job application, the system will try to send an email via Gmail SMTP
2. If authentication fails (which is currently the case), the email content will be printed to the console instead
3. The application will continue to work normally, but actual emails won't be sent until the configuration is fixed

## How to Fix Email Sending

To enable actual email sending via Gmail, you need to set up an App Password:

1. **Generate an App Password for your Gmail account**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Make sure 2-Step Verification is enabled
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and "Other" as the device (name it "Azayd")
   - Click "Generate"
   - Copy the 16-character password that appears

2. **Update the .env file**:
   - Open the `.env` file in the project root
   - Replace `your_app_password_here` with the generated App Password
   - Save the file

3. **Test the configuration**:
   - Submit a test job application
   - Check if the email is sent successfully
   - If not, check the server logs for error messages

## Troubleshooting

If emails still aren't being sent after updating the App Password:

1. **Check server logs** for specific error messages
2. **Verify Gmail settings** to ensure less secure apps or SMTP access is enabled
3. **Try a different email service** if Gmail continues to cause issues

## Current Implementation

The current implementation in `website/api_views.py` includes a fallback mechanism that will:

1. Try to send the email using the configured SMTP backend
2. If that fails, it will fall back to the console backend
3. Either way, the job application will be marked as successful

This ensures that the application process works smoothly for users even if email sending fails.