from django.core.files.storage import FileSystemStorage
from django.core.exceptions import ValidationError
import os
import mimetypes

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
    
    def _save(self, name, content):
        """Validate file before saving."""
        # Check file size
        if content.size > self.MAX_FILE_SIZE:
            raise ValidationError(f"File size exceeds maximum limit of {self.MAX_FILE_SIZE / (1024 * 1024)}MB")
        
        # Get file extension
        _, ext = os.path.splitext(name)
        ext = ext.lower()
        
        # Use mimetypes module instead of python-magic
        guessed_type = mimetypes.guess_type(name)[0]
        
        # If mimetypes couldn't determine the type, fall back to extension-based validation
        if not guessed_type:
            # Check if extension is in any of our allowed types
            allowed_extensions = [ext for exts in self.ALLOWED_MIME_TYPES.values() for ext in exts]
            if ext not in allowed_extensions:
                raise ValidationError(f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}")
        else:
            # Validate MIME type and extension
            if guessed_type not in self.ALLOWED_MIME_TYPES or ext not in self.ALLOWED_MIME_TYPES.get(guessed_type, []):
                raise ValidationError(f"Unsupported file type. Allowed types: {', '.join([ext for exts in self.ALLOWED_MIME_TYPES.values() for ext in exts])}")
        
        # Sanitize filename
        clean_name = self.get_valid_name(os.path.basename(name))
        name = os.path.join(os.path.dirname(name), clean_name)
        
        # Call the parent's _save method
        return super()._save(name, content)