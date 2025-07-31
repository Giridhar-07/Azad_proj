from django.contrib import admin
from .models import Service, JobPosting, TeamMember, ContactMessage, ResumeSubmission, JobApplication

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description')

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'location', 'job_type', 'is_active', 'created_at')
    list_filter = ('is_active', 'department', 'location', 'job_type')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description', 'requirements')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'department', 'location', 'job_type')
        }),
        ('Job Details', {
            'fields': ('description', 'requirements', 'salary_range', 'experience_level')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'is_active', 'order')
    list_filter = ('is_active',)
    search_fields = ('name', 'position', 'bio')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')

@admin.register(ResumeSubmission)
class ResumeSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'status', 'is_reviewed')
    list_filter = ('status', 'is_reviewed', 'created_at')
    search_fields = ('name', 'email', 'message', 'notes')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Applicant Information', {
            'fields': ('name', 'email', 'phone', 'message')
        }),
        ('Resume', {
            'fields': ('resume_file', 'resume_link')
        }),
        ('Status', {
            'fields': ('status', 'is_reviewed', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'job', 'created_at', 'status', 'is_reviewed', 'email_sent')
    list_filter = ('status', 'is_reviewed', 'email_sent', 'created_at')
    search_fields = ('name', 'email', 'cover_letter', 'notes', 'job__title')
    readonly_fields = ('created_at', 'email_sent')
    fieldsets = (
        ('Job Information', {
            'fields': ('job',)
        }),
        ('Applicant Information', {
            'fields': ('name', 'email', 'phone', 'cover_letter')
        }),
        ('Resume', {
            'fields': ('resume_file', 'resume_link')
        }),
        ('Status', {
            'fields': ('status', 'is_reviewed', 'notes', 'email_sent')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_reviewed', 'send_confirmation_email']
    
    def mark_as_reviewed(self, request, queryset):
        queryset.update(is_reviewed=True)
    mark_as_reviewed.short_description = "Mark selected applications as reviewed"
    
    def send_confirmation_email(self, request, queryset):
        from django.core.mail import send_mail
        from django.conf import settings
        
        for application in queryset.filter(email_sent=False):
            try:
                job_title = application.job.title if application.job else "our company"
                send_mail(
                    f'Application Received for {job_title}',
                    f'Dear {application.name},\n\nThank you for applying for the {job_title} position. We have received your application and will review it shortly.\n\nBest regards,\nAzayd IT Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [application.email],
                    fail_silently=False,
                )
                application.email_sent = True
                application.save()
            except Exception as e:
                self.message_user(request, f"Error sending email to {application.email}: {str(e)}", level='error')
        
        self.message_user(request, f"Confirmation emails sent to {queryset.filter(email_sent=True).count()} applicants.")
    send_confirmation_email.short_description = "Send confirmation email to selected applicants"