from django.db import models
from django.utils.text import slugify

class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text='Font Awesome icon name without the fa- prefix')
    image = models.ImageField(upload_to='services/', blank=True, null=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class TeamMember(models.Model):
    """
    Enhanced TeamMember model with additional fields for modern requirements.
    """
    name = models.CharField(max_length=100, help_text="Full name of the team member")
    position = models.CharField(max_length=100, help_text="Job title or position")
    department = models.CharField(max_length=50, blank=True, help_text="Department or team")
    bio = models.TextField(help_text="Professional biography")
    image = models.ImageField(upload_to='team/', help_text="Profile image")
    
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