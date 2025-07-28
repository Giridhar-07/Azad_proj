from django.core.files.storage import FileSystemStorage
from django.core.exceptions import ValidationError
import os
import mimetypes
import re
import logging
import uuid

logger = logging.getLogger('django.security')

class SecureFileStorage(FileSystemStorage):
    """Custom storage class that validates file uploads for security."""
    
    # Allowed MIME types
    ALLOWED_MIME_TYPES = {
        # Images
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/svg+xml': ['.svg'],
        # Documents
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    }
    
    # Maximum file size (5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    # Dangerous file extensions that should be rejected
    DANGEROUS_EXTENSIONS = [
        '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.pl', '.cgi', '.asp', '.aspx',
        '.js', '.vbs', '.py', '.jar', '.dll', '.bin', '.com', '.msi', '.htaccess'
    ]
    
    # Regex pattern for safe filenames
    SAFE_FILENAME_PATTERN = re.compile(r'^[a-zA-Z0-9_.-]+$')
    
    def _save(self, name, content):
        """Validate file before saving."""
        try:
            # Log file upload attempt
            logger.info(f"File upload attempt: {name}, size: {content.size} bytes")
            
            # Check file size
            if content.size > self.MAX_FILE_SIZE:
                logger.warning(f"File size validation failed: {name}, size: {content.size} bytes")
                raise ValidationError(f"File size exceeds maximum limit of {self.MAX_FILE_SIZE / (1024 * 1024)}MB")
            
            # Get file extension
            _, ext = os.path.splitext(name)
            ext = ext.lower()
            
            # Reject dangerous file extensions
            if ext in self.DANGEROUS_EXTENSIONS:
                logger.warning(f"Dangerous file extension detected: {ext} in file {name}")
                raise ValidationError(f"File type not allowed for security reasons")
            
            # Use mimetypes module for MIME type detection
            guessed_type = mimetypes.guess_type(name)[0]
            
            # If mimetypes couldn't determine the type, fall back to extension-based validation
            if not guessed_type:
                # Check if extension is in any of our allowed types
                allowed_extensions = [ext for exts in self.ALLOWED_MIME_TYPES.values() for ext in exts]
                if ext not in allowed_extensions:
                    logger.warning(f"Unsupported file extension: {ext} in file {name}")
                    raise ValidationError(f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}")
            else:
                # Validate MIME type and extension
                if guessed_type not in self.ALLOWED_MIME_TYPES or ext not in self.ALLOWED_MIME_TYPES.get(guessed_type, []):
                    logger.warning(f"MIME type validation failed: {guessed_type} for file {name}")
                    raise ValidationError(f"Unsupported file type. Allowed types: {', '.join([ext for exts in self.ALLOWED_MIME_TYPES.values() for ext in exts])}")
            
            # Advanced filename sanitization
            original_filename = os.path.basename(name)
            filename_without_ext, ext = os.path.splitext(original_filename)
            
            # Check if filename matches safe pattern
            if not self.SAFE_FILENAME_PATTERN.match(filename_without_ext):
                # If not safe, generate a random filename
                logger.warning(f"Unsafe filename detected: {original_filename}, generating random name")
                filename_without_ext = str(uuid.uuid4())
            
            # Sanitize filename using Django's get_valid_name
            clean_name = self.get_valid_name(f"{filename_without_ext}{ext}")
            
            # Construct final path
            name = os.path.join(os.path.dirname(name), clean_name)
            
            logger.info(f"File validated successfully: {name}")
            
            # Call the parent's _save method
            return super()._save(name, content)
        except Exception as e:
            logger.error(f"File upload error: {str(e)} for file {name}")
            raise