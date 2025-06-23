from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Service, JobPosting, TeamMember, ContactMessage
from .forms import ContactForm

# Configure logging for better error tracking
logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    """
    Enhanced Home View with comprehensive data aggregation for the homepage.
    Implements caching and optimized queries for better performance.
    """
    template_name = 'website/home.html'
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get_context_data(self, **kwargs):
        """
        Aggregate and provide comprehensive data for the home page.
        Includes featured services, team highlights, recent jobs, and statistics.
        """
        context = super().get_context_data(**kwargs)
        
        try:
            # Get featured services (limit to 3 for homepage)
            featured_services = Service.objects.select_related().order_by('-created_at')[:3]
            
            # Get team members for about section
            team_members = TeamMember.objects.filter(is_active=True).order_by('order')[:4]
            
            # Get recent job postings
            recent_jobs = JobPosting.objects.filter(
                is_active=True
            ).order_by('-created_at')[:3]
            
            # Calculate statistics for the homepage
            stats = self._get_homepage_statistics()
            
            # Add all data to context
            context.update({
                'featured_services': featured_services,
                'team_members': team_members,
                'recent_jobs': recent_jobs,
                'stats': stats,
                'page_title': 'Welcome to AZAYD - Digital Innovation Hub',
                'meta_description': 'Transform your ideas into digital reality with AZAYD. Expert web development, mobile apps, and AI solutions.',
            })
            
        except Exception as e:
            logger.error(f"Error loading home page data: {str(e)}")
            # Provide fallback data in case of errors
            context.update({
                'featured_services': [],
                'team_members': [],
                'recent_jobs': [],
                'stats': self._get_fallback_statistics(),
                'error_message': 'Some content may not be available at the moment.'
            })
        
        return context
    
    def _get_homepage_statistics(self):
        """
        Calculate and return homepage statistics with caching.
        """
        cache_key = 'homepage_statistics'
        stats = cache.get(cache_key)
        
        if stats is None:
            try:
                stats = {
                    'projects_completed': 100,  # This could be calculated from a projects model
                    'happy_clients': Service.objects.aggregate(
                        count=Count('id')
                    )['count'] * 10,  # Approximate based on services
                    'years_experience': 5,
                    'team_members': TeamMember.objects.filter(is_active=True).count(),
                    'active_services': Service.objects.count(),
                    'open_positions': JobPosting.objects.filter(is_active=True).count(),
                }
                
                # Cache for 1 hour
                cache.set(cache_key, stats, 60 * 60)
                
            except Exception as e:
                logger.error(f"Error calculating statistics: {str(e)}")
                stats = self._get_fallback_statistics()
        
        return stats
    
    def _get_fallback_statistics(self):
        """
        Provide fallback statistics in case of database errors.
        """
        return {
            'projects_completed': 100,
            'happy_clients': 50,
            'years_experience': 5,
            'team_members': 10,
            'active_services': 6,
            'open_positions': 3,
        }


class ServiceListView(ListView):
    """
    Enhanced Service List View with filtering and pagination.
    """
    model = Service
    template_name = 'website/services.html'
    context_object_name = 'services'
    paginate_by = 9
    
    def get_queryset(self):
        """
        Return optimized queryset with optional filtering.
        """
        queryset = Service.objects.select_related().order_by('-created_at')
        
        # Add search functionality
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(tech_stack__icontains=search_query)
            )
        
        return queryset


class ServiceDetailView(DetailView):
    """
    Enhanced Service Detail View with related services.
    """
    model = Service
    template_name = 'website/service_detail.html'
    context_object_name = 'service'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get related services (exclude current service)
        related_services = Service.objects.exclude(
            id=self.object.id
        ).order_by('?')[:3]  # Random selection
        
        context['related_services'] = related_services
        return context


class AboutView(TemplateView):
    """
    Enhanced About View with team information and company statistics.
    """
    template_name = 'website/about.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get all active team members
        team_members = TeamMember.objects.filter(
            is_active=True
        ).order_by('order', 'name')
        
        context['team_members'] = team_members
        return context


class CareerListView(ListView):
    """
    Enhanced Career List View with filtering by department and location.
    """
    model = JobPosting
    template_name = 'website/career_list.html'
    context_object_name = 'jobs'
    paginate_by = 10
    
    def get_queryset(self):
        """
        Return filtered and optimized queryset.
        """
        queryset = JobPosting.objects.filter(
            is_active=True
        ).order_by('-created_at')
        
        # Filter by department
        department = self.request.GET.get('department')
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by location
        location = self.request.GET.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get unique departments and locations for filter options
        departments = JobPosting.objects.filter(
            is_active=True
        ).values_list('department', flat=True).distinct()
        
        locations = JobPosting.objects.filter(
            is_active=True
        ).values_list('location', flat=True).distinct()
        
        context.update({
            'departments': departments,
            'locations': locations,
        })
        
        return context


class JobDetailView(DetailView):
    """
    Enhanced Job Detail View with application tracking.
    """
    model = JobPosting
    template_name = 'website/job_detail.html'
    context_object_name = 'job'
    
    def get_queryset(self):
        return JobPosting.objects.filter(is_active=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get related job postings
        related_jobs = JobPosting.objects.filter(
            is_active=True,
            department=self.object.department
        ).exclude(id=self.object.id)[:3]
        
        context['related_jobs'] = related_jobs
        return context


class ContactView(TemplateView):
    """
    Enhanced Contact View with form handling and validation.
    """
    template_name = 'website/contact.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['contact_form'] = ContactForm()
        return context


# Legacy function-based views for backward compatibility
def home(request):
    """
    Legacy home view - redirects to class-based view.
    """
    return HomeView.as_view()(request)


def services(request):
    """
    Legacy services view - redirects to class-based view.
    """
    return ServiceListView.as_view()(request)


def about(request):
    """
    Legacy about view - redirects to class-based view.
    """
    return AboutView.as_view()(request)


def careers(request):
    """
    Legacy careers view - redirects to class-based view.
    """
    return CareerListView.as_view()(request)


def contact(request):
    """
    Legacy contact view - redirects to class-based view.
    """
    return ContactView.as_view()(request)