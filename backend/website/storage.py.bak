from django.core.files.storage import FileSystemStorage
from django.core.exceptions import ValidationError
import os
import magic

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
        
        # Check file type using python-magic
        file_content = content.read(2048)  # Read first 2KB for MIME detection
        content.seek(0)  # Reset file pointer
        
        mime = magic.Magic(mime=True)
        file_mime = mime.from_buffer(file_content)
        
        # Get file extension
        _, ext = os.path.splitext(name)
        ext = ext.lower()
        
        # Validate MIME type and extension
        if file_mime not in self.ALLOWED_MIME_TYPES or ext not in self.ALLOWED_MIME_TYPES.get(file_mime, []):
            raise ValidationError(f"Unsupported file type. Allowed types: {', '.join([ext for exts in self.ALLOWED_MIME_TYPES.values() for ext in exts])}")
        
        # Sanitize filename
        clean_name = self.get_valid_name(os.path.basename(name))
        name = os.path.join(os.path.dirname(name), clean_name)
        
        return super()._save(name, content)