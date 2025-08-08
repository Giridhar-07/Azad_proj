from rest_framework import serializers
from django.utils import timezone
from .models import (
    Service, TeamMember, JobPosting, ContactMessage,
    ResumeSubmission, JobApplication
)

# === Shared Validators ===

def validate_name(value):
    value = value.strip()
    if len(value) < 2:
        raise serializers.ValidationError("Name must be at least 2 characters long.")
    return value.title()

def validate_email(value):
    value = value.strip().lower()
    if '@' not in value:
        raise serializers.ValidationError("Please provide a valid email address.")
    return value


# === Service Serializers ===

class ServiceSerializer(serializers.ModelSerializer):
    tech_stack_list = serializers.SerializerMethodField()
    formatted_price = serializers.SerializerMethodField()
    created_date = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'slug', 'description', 'icon', 'image',
            'price', 'formatted_price', 'tech_stack', 'tech_stack_list',
            'created_date', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_tech_stack_list(self, obj):
        return [tech.strip() for tech in obj.tech_stack.split(',') if tech.strip()] if obj.tech_stack else []

    def get_formatted_price(self, obj):
        return f"${obj.price:,.2f}" if obj.price else "Contact for pricing"

    def get_created_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y')


class ServiceDetailSerializer(ServiceSerializer):
    features = serializers.SerializerMethodField()

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ['features']

    def get_features(self, obj):
        return [
            "Professional Development",
            "24/7 Support",
            "Quality Assurance",
            "Timely Delivery",
            "Modern Technology Stack"
        ]


# === Team Member Serializer ===

class TeamMemberSerializer(serializers.ModelSerializer):
    linkedin_url = serializers.SerializerMethodField()
    twitter_url = serializers.SerializerMethodField()
    github_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    primary_skills = serializers.SerializerMethodField()
    experience_level = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'full_name', 'position', 'department', 'bio', 'image',
            'linkedin_url', 'twitter_url', 'github_url', 'email',
            'skills', 'primary_skills', 'years_experience', 'experience_level',
            'achievements', 'is_active', 'is_leadership', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order', 'created_at', 'updated_at']

    def get_linkedin_url(self, obj):
        return obj.linkedin or ''

    def get_twitter_url(self, obj):
        return obj.twitter or ''

    def get_github_url(self, obj):
        return obj.github or ''

    def get_full_name(self, obj):
        return obj.full_name

    def get_primary_skills(self, obj):
        return obj.primary_skills

    def get_experience_level(self, obj):
        years = obj.years_experience
        if years < 2:
            return 'Junior'
        elif years < 5:
            return 'Mid-level'
        elif years < 10:
            return 'Senior'
        return 'Expert'


# === Job Posting Serializer ===

class JobPostingSerializer(serializers.ModelSerializer):
    requirements_list = serializers.SerializerMethodField()
    posted_date = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'slug', 'department', 'location', 'job_type',
            'description', 'requirements', 'requirements_list',
            'posted_date', 'salary_range', 'is_active', 'is_recent',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_requirements_list(self, obj):
        return [r.strip() for r in obj.requirements.split('\n') if r.strip()] if obj.requirements else []

    def get_posted_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_is_recent(self, obj):
        return obj.created_at >= timezone.now() - timezone.timedelta(days=30)


# === Contact Message Serializer ===

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']

    def validate_name(self, value): return validate_name(value)
    def validate_email(self, value): return validate_email(value)

    def validate_subject(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Subject must be at least 5 characters long.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value


# === Resume Submission Serializer ===

class ResumeSubmissionSerializer(serializers.ModelSerializer):
    resume_file = serializers.FileField(required=False, allow_null=True)
    resume_link = serializers.URLField(required=False, allow_null=True)

    class Meta:
        model = ResumeSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'message',
            'resume_file', 'resume_link',
            'created_at', 'status'
        ]
        read_only_fields = ['id', 'created_at', 'status', 'is_reviewed']

    def validate_name(self, value): return validate_name(value)
    def validate_email(self, value): return validate_email(value)

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value

    def validate(self, data):
        if not data.get('resume_file') and not data.get('resume_link'):
            raise serializers.ValidationError("Either a resume file or a link to a resume must be provided.")
        return data


# === Job Application Serializer ===

class JobApplicationSerializer(serializers.ModelSerializer):
    resume_file = serializers.FileField(required=False, allow_null=True)
    resume_link = serializers.URLField(required=False, allow_null=True)
    job_id = serializers.IntegerField(write_only=True)
    job_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job_id', 'job_title', 'name', 'email', 'phone', 'cover_letter',
            'resume_file', 'resume_link', 'created_at', 'status', 'email_sent'
        ]
        read_only_fields = ['id', 'created_at', 'status', 'is_reviewed', 'email_sent']

    def get_job_title(self, obj):
        return obj.job.title if obj.job else "Unknown Job"

    def validate_name(self, value): return validate_name(value)
    def validate_email(self, value): return validate_email(value)

    def validate_cover_letter(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Cover letter must be at least 10 characters long.")
        return value

    def validate_job_id(self, value):
        try:
            JobPosting.objects.get(id=value, is_active=True)
            return value
        except JobPosting.DoesNotExist:
            raise serializers.ValidationError("The job you are applying for does not exist or is no longer active.")

    def validate(self, data):
        if not data.get('resume_file') and not data.get('resume_link'):
            raise serializers.ValidationError("Either a resume file or a link to a resume must be provided.")
        return data

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        validated_data['job'] = JobPosting.objects.get(id=job_id)
        validated_data['status'] = 'new'
        validated_data['is_reviewed'] = False
        return super().create(validated_data)


# === Utility Serializers for Aggregated Responses ===

class HomePageDataSerializer(serializers.Serializer):
    featured_services = ServiceSerializer(many=True, read_only=True)
    team_members = TeamMemberSerializer(many=True, read_only=True)
    recent_jobs = JobPostingSerializer(many=True, read_only=True)
    stats = serializers.DictField(read_only=True)
    meta = serializers.DictField(read_only=True)


class StatisticsSerializer(serializers.Serializer):
    projects_completed = serializers.IntegerField()
    happy_clients = serializers.IntegerField()
    years_experience = serializers.IntegerField()
    team_members = serializers.IntegerField()
    active_services = serializers.IntegerField()
    open_positions = serializers.IntegerField()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['formatted'] = {
            'projects_completed': f"{data['projects_completed']}+",
            'happy_clients': f"{data['happy_clients']}+",
            'years_experience': f"{data['years_experience']}+",
            'team_members': str(data['team_members']),
            'active_services': str(data['active_services']),
            'open_positions': str(data['open_positions']),
        }
        return data
