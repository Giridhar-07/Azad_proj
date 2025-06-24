from rest_framework import serializers
from django.utils import timezone
from .models import Service, TeamMember, JobPosting, ContactMessage


class ServiceSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for Service model with computed fields and validation.
    """
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
        """
        Convert comma-separated tech stack to list.
        """
        if obj.tech_stack:
            return [tech.strip() for tech in obj.tech_stack.split(',') if tech.strip()]
        return []
    
    def get_formatted_price(self, obj):
        """
        Format price with currency symbol.
        """
        if obj.price:
            return f"${obj.price:,.2f}"
        return "Contact for pricing"
    
    def get_created_date(self, obj):
        """
        Return formatted creation date.
        """
        return obj.created_at.strftime('%B %d, %Y')


class ServiceDetailSerializer(ServiceSerializer):
    """
    Detailed serializer for individual service views with additional information.
    """
    features = serializers.SerializerMethodField()
    
    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ['features']
    
    def get_features(self, obj):
        """
        Generate features list based on service description.
        This could be enhanced to use a separate features field in the model.
        """
        # For now, return some default features based on service type
        default_features = [
            "Professional Development",
            "24/7 Support",
            "Quality Assurance",
            "Timely Delivery",
            "Modern Technology Stack"
        ]
        return default_features


class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for TeamMember model with comprehensive data and validation.
    """
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
        """Return LinkedIn URL or empty string."""
        return obj.linkedin if obj.linkedin else ''
    
    def get_twitter_url(self, obj):
        """Return Twitter URL or empty string."""
        return obj.twitter if obj.twitter else ''
    
    def get_github_url(self, obj):
        """Return GitHub URL or empty string."""
        return obj.github if obj.github else ''
    
    def get_full_name(self, obj):
        """Return full name."""
        return obj.full_name
    
    def get_primary_skills(self, obj):
        """Return primary skills for display."""
        return obj.primary_skills
    
    def get_experience_level(self, obj):
        """Return experience level based on years."""
        years = obj.years_experience
        if years < 2:
            return 'Junior'
        elif years < 5:
            return 'Mid-level'
        elif years < 10:
            return 'Senior'
        else:
            return 'Expert'


class JobPostingSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for JobPosting model with computed fields and formatting.
    """
    requirements_list = serializers.SerializerMethodField()
    posted_date = serializers.SerializerMethodField()
    job_type = serializers.SerializerMethodField()
    salary_range = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'slug', 'department', 'location', 'job_type',
            'description', 'requirements', 'requirements_list', 'posted_date',
            'salary_range', 'is_active', 'is_recent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_requirements_list(self, obj):
        """
        Split requirements text by newlines and convert to list.
        """
        if obj.requirements:
            return [req.strip() for req in obj.requirements.split('\n') if req.strip()]
        return []
    
    def get_posted_date(self, obj):
        """
        Return the created_at date formatted as string.
        """
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_job_type(self, obj):
        """
        Since job type field doesn't exist in model, return a default value.
        This could be added to the model in the future.
        """
        return 'Full-time'  # Default value
    
    def get_salary_range(self, obj):
        """
        Return salary range. Since this field doesn't exist in model,
        return a placeholder. This could be added to the model.
        """
        return 'Competitive salary'
    
    def get_is_recent(self, obj):
        """
        Check if the job posting is recent (within last 30 days).
        """
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        return obj.created_at >= thirty_days_ago


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for ContactMessage model with validation and sanitization.
    """
    
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']
    
    def validate_name(self, value):
        """
        Validate and sanitize name field.
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip().title()
    
    def validate_email(self, value):
        """
        Additional email validation.
        """
        if not value or '@' not in value:
            raise serializers.ValidationError("Please provide a valid email address.")
        return value.lower().strip()
    
    def validate_subject(self, value):
        """
        Validate subject field.
        """
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Subject must be at least 5 characters long.")
        return value.strip()
    
    def validate_message(self, value):
        """
        Validate message field.
        """
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()
    
    def create(self, validated_data):
        """
        Create contact message with additional processing.
        """
        # You could add additional processing here, such as:
        # - Spam detection
        # - Email notifications
        # - Integration with CRM systems
        return super().create(validated_data)


class HomePageDataSerializer(serializers.Serializer):
    """
    Serializer for homepage data aggregation.
    """
    featured_services = ServiceSerializer(many=True, read_only=True)
    team_members = TeamMemberSerializer(many=True, read_only=True)
    recent_jobs = JobPostingSerializer(many=True, read_only=True)
    stats = serializers.DictField(read_only=True)
    meta = serializers.DictField(read_only=True)


class StatisticsSerializer(serializers.Serializer):
    """
    Serializer for company statistics.
    """
    projects_completed = serializers.IntegerField()
    happy_clients = serializers.IntegerField()
    years_experience = serializers.IntegerField()
    team_members = serializers.IntegerField()
    active_services = serializers.IntegerField()
    open_positions = serializers.IntegerField()
    
    def to_representation(self, instance):
        """
        Format statistics for display.
        """
        data = super().to_representation(instance)
        
        # Add formatted versions for display
        data['formatted'] = {
            'projects_completed': f"{data['projects_completed']}+",
            'happy_clients': f"{data['happy_clients']}+",
            'years_experience': f"{data['years_experience']}+",
            'team_members': str(data['team_members']),
            'active_services': str(data['active_services']),
            'open_positions': str(data['open_positions'])
        }
        
        return data