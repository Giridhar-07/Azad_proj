from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from .storage import SecureFileStorage


# === Reusable Constants & Helpers ===

def validate_file_size(file):
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'File size cannot exceed 5MB. Current size: {file.size/(1024*1024):.2f}MB')
    return file

IMAGE_VALIDATORS = [
    FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
    validate_file_size,
]

RESUME_VALIDATORS = [
    FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']),
    validate_file_size,
]

def secure_file_field(upload_to, validators):
    return models.FileField(
        upload_to=upload_to,
        blank=True,
        null=True,
        storage=SecureFileStorage(),
        validators=validators
    )


# === Mixins ===

class AutoSlugMixin(models.Model):
    slug = models.SlugField(unique=True, blank=True)
    slug_source_field = 'title'

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            base = getattr(self, self.slug_source_field, '')
            self.slug = slugify(base)
        super().save(*args, **kwargs)


# === Models ===

class Service(AutoSlugMixin):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text='Font Awesome icon name without the fa- prefix')
    image = models.ImageField(
        upload_to='services/',
        blank=True,
        null=True,
        storage=SecureFileStorage(),
        validators=IMAGE_VALIDATORS,
        help_text='Image file (max 5MB, jpg/png/gif only)'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tech_stack = models.CharField(max_length=500, blank=True, help_text='Comma-separated list of technologies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"


# Add this in models.py (JobPosting)

class JobPostingManager(models.Manager):
    def active(self):
        return self.filter(is_active=True)

class JobPosting(models.Model):
    ...
    objects = JobPostingManager()

class JobPosting(AutoSlugMixin):
    title = models.CharField(max_length=200)
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

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Job Posting"
        verbose_name_plural = "Job Postings"

    def __str__(self):
        return f"{self.title} ({self.department})"



# Add this for TeamMember

class TeamMemberManager(models.Manager):
    def active(self):
        return self.filter(is_active=True)
    
    def ordered(self):
        return self.active().order_by('order', 'name')

class TeamMember(models.Model):
    ...
    objects = TeamMemberManager()


class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=50, blank=True)
    bio = models.TextField()
    image = models.ImageField(
        upload_to='team/',
        storage=SecureFileStorage(),
        validators=IMAGE_VALIDATORS,
        help_text="Profile image (max 5MB, jpg/png only)"
    )

    linkedin = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    github = models.URLField(blank=True)
    email = models.EmailField(blank=True)

    skills = models.JSONField(default=list, blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    achievements = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)
    is_leadership = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

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
        return self.name

    @property
    def primary_skills(self):
        return self.skills[:5] if self.skills else []

    def save(self, *args, **kwargs):
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
        return f"{self.name} ({self.email}) - {self.subject}"


class ResumeSubmission(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    resume_file = secure_file_field('resumes/', RESUME_VALIDATORS)
    resume_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[
        ('new', 'New Submission'),
        ('reviewing', 'Under Review'),
        ('contacted', 'Contacted'),
        ('interview', 'Interview Scheduled'),
        ('rejected', 'Not Selected'),
        ('hired', 'Hired')
    ], default='new')
    notes = models.TextField(blank=True)

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
        if not self.resume_file and not self.resume_link:
            raise ValidationError("Either a resume file or a link to a resume must be provided.")
        return super().clean()


class JobApplication(models.Model):
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, related_name='applications')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    cover_letter = models.TextField()
    resume_file = secure_file_field('job_applications/', RESUME_VALIDATORS)
    resume_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[
        ('new', 'New Application'),
        ('reviewing', 'Under Review'),
        ('contacted', 'Contacted'),
        ('interview', 'Interview Scheduled'),
        ('rejected', 'Not Selected'),
        ('hired', 'Hired')
    ], default='new')
    notes = models.TextField(blank=True)
    email_sent = models.BooleanField(default=False)

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
        if not self.resume_file and not self.resume_link:
            raise ValidationError("Either a resume file or a link to a resume must be provided.")
        return super().clean()
