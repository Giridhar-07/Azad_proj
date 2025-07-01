from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from .storage import SecureFileStorage

def validate_file_size(file):
    """Validate file size (max 5MB)."""
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'File size cannot exceed 5MB. Current size: {file.size/(1024*1024):.2f}MB')
    return file

class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text='Font Awesome icon name without the fa- prefix')
    image = models.ImageField(
        upload_to='services/', 
        blank=True, 
        null=True,
        storage=SecureFileStorage(),
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']), validate_file_size],
        help_text='Image file (max 5MB, jpg/png/gif only)'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tech_stack = models.CharField(max_length=500, blank=True, help_text='Comma-separated list of technologies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class JobPosting(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField()
    is_active = models.BooleanField(default=True)
    job_type = models.CharField(max_length=50, blank=True, choices=[
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote')
    ])
    salary_range = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
        
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Job Posting"
        verbose_name_plural = "Job Postings"

class TeamMember(models.Model):
    """
    Enhanced TeamMember model with additional fields for modern requirements.
    """
    name = models.CharField(max_length=100, help_text="Full name of the team member")
    position = models.CharField(max_length=100, help_text="Job title or position")
    department = models.CharField(max_length=50, blank=True, help_text="Department or team")
    bio = models.TextField(help_text="Professional biography")
    image = models.ImageField(
        upload_to='team/', 
        storage=SecureFileStorage(),
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']), validate_file_size],
        help_text="Profile image (max 5MB, jpg/png only)"
    )
    
    # Social media links
    linkedin = models.URLField(blank=True, help_text="LinkedIn profile URL")
    twitter = models.URLField(blank=True, help_text="Twitter profile URL")
    github = models.URLField(blank=True, help_text="GitHub profile URL")
    email = models.EmailField(blank=True, help_text="Professional email address")
    
    # Professional details
    skills = models.JSONField(default=list, blank=True, help_text="List of skills and technologies")
    years_experience = models.PositiveIntegerField(default=0, help_text="Years of professional experience")
    achievements = models.JSONField(default=list, blank=True, help_text="Notable achievements and certifications")
    
    # Status and ordering
    is_active = models.BooleanField(default=True, help_text="Is this member currently active?")
    is_leadership = models.BooleanField(default=False, help_text="Is this member part of leadership team?")
    order = models.IntegerField(default=0, help_text="Display order (lower numbers appear first)")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"
        indexes = [
            models.Index(fields=['is_active', 'order']),
            models.Index(fields=['is_leadership', 'order']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.position}"
    
    @property
    def full_name(self):
        """Return the full name (same as name for now, but could be enhanced)."""
        return self.name
    
    @property
    def primary_skills(self):
        """Return the first 5 skills for display purposes."""
        return self.skills[:5] if self.skills else []
    
    def save(self, *args, **kwargs):
        """Override save to handle automatic leadership detection."""
        # Auto-detect leadership based on position keywords
        leadership_keywords = ['director', 'manager', 'lead', 'head', 'ceo', 'cto', 'founder', 'vp']
        if any(keyword in self.position.lower() for keyword in leadership_keywords):
            self.is_leadership = True
        
        super().save(*args, **kwargs)

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.subject}"

class ResumeSubmission(models.Model):
    """Model for storing resume submissions from career applicants."""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    resume_file = models.FileField(
        upload_to='resumes/', 
        blank=True, 
        null=True,
        storage=SecureFileStorage(),
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']), 
            validate_file_size
        ],
        help_text='Resume file (max 5MB, PDF or Word document)'
    )
    resume_link = models.URLField(blank=True, null=True, help_text="Link to resume on Google Drive or similar")
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New Submission'),
            ('reviewing', 'Under Review'),
            ('contacted', 'Contacted'),
            ('interview', 'Interview Scheduled'),
            ('rejected', 'Not Selected'),
            ('hired', 'Hired')
        ],
        default='new'
    )
    notes = models.TextField(blank=True, help_text="Internal notes about this application")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Resume Submission"
        verbose_name_plural = "Resume Submissions"
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['is_reviewed']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self):
        """Ensure that either resume_file or resume_link is provided."""
        if not self.resume_file and not self.resume_link:
            raise ValidationError("Either a resume file or a link to a resume must be provided.")
        return super().clean()


class JobApplication(models.Model):
    """Model for storing job applications for specific job postings."""
    job = models.ForeignKey(
        JobPosting, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='applications',
        help_text="The job posting this application is for"
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    cover_letter = models.TextField(help_text="Cover letter or additional information")
    resume_file = models.FileField(
        upload_to='job_applications/', 
        blank=True, 
        null=True,
        storage=SecureFileStorage(),
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']), 
            validate_file_size
        ],
        help_text='Resume file (max 5MB, PDF or Word document)'
    )
    resume_link = models.URLField(blank=True, null=True, help_text="Link to resume on Google Drive or similar")
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New Application'),
            ('reviewing', 'Under Review'),
            ('contacted', 'Contacted'),
            ('interview', 'Interview Scheduled'),
            ('rejected', 'Not Selected'),
            ('hired', 'Hired')
        ],
        default='new'
    )
    notes = models.TextField(blank=True, help_text="Internal notes about this application")
    email_sent = models.BooleanField(default=False, help_text="Whether confirmation email was sent")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['is_reviewed']),
            models.Index(fields=['email']),
            models.Index(fields=['job']),
        ]

    def __str__(self):
        job_title = self.job.title if self.job else "Unknown Job"
        return f"{self.name} - {job_title} - {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self):
        """Ensure that either resume_file or resume_link is provided."""
        if not self.resume_file and not self.resume_link:
            raise ValidationError("Either a resume file or a link to a resume must be provided.")
        return super().clean()