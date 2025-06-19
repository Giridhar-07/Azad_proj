from rest_framework import serializers
from .models import Service, TeamMember, JobPosting, ContactMessage

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'title', 'description', 'image', 'price', 'tech_stack']

class TeamMemberSerializer(serializers.ModelSerializer):
    linkedin_url = serializers.SerializerMethodField()
    twitter_url = serializers.SerializerMethodField()
    github_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'position', 'bio', 'image', 'linkedin_url', 'twitter_url', 'github_url']
    
    def get_linkedin_url(self, obj):
        return obj.linkedin if obj.linkedin else ''
    
    def get_twitter_url(self, obj):
        return obj.twitter if obj.twitter else ''
    
    def get_github_url(self, obj):
        # GitHub URL is not in the model, return empty string
        return ''

class JobPostingSerializer(serializers.ModelSerializer):
    requirements = serializers.SerializerMethodField()
    posted_date = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    salary_range = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'department', 'location', 'type', 'description', 'requirements', 'posted_date', 'salary_range']
    
    def get_requirements(self, obj):
        # Split requirements text by newlines and convert to list
        if obj.requirements:
            return [req.strip() for req in obj.requirements.split('\n') if req.strip()]
        return []
    
    def get_posted_date(self, obj):
        # Return the created_at date formatted as string
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_type(self, obj):
        # Since type field doesn't exist in model, return a default value
        return 'Full-time'  # Default value
    
    def get_salary_range(self, obj):
        # Since salary_range field doesn't exist in model, return a default value
        return '$50,000 - $100,000'  # Default value

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']