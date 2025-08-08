from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Count, Q
import logging

from .models import Service, JobPosting, TeamMember, ContactMessage
from .forms import ContactForm

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    template_name = 'website/home.html'

    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            context.update({
                'featured_services': Service.objects.order_by('-created_at')[:3],
                'team_members': TeamMember.objects.active().ordered()[:4],
                'recent_jobs': JobPosting.objects.active().order_by('-created_at')[:3],
                'stats': self._get_homepage_statistics(),
                'page_title': 'Welcome to AZAYD - Digital Innovation Hub',
                'meta_description': 'Transform your ideas into digital reality with AZAYD. Expert web development, mobile apps, and AI solutions.',
            })
        except Exception as e:
            logger.error(f"Error loading home page data: {str(e)}")
            context.update({
                'featured_services': [],
                'team_members': [],
                'recent_jobs': [],
                'stats': self._get_fallback_statistics(),
                'error_message': 'Some content may not be available at the moment.'
            })
        return context

    def _get_homepage_statistics(self):
        cache_key = 'homepage_statistics'
        stats = cache.get(cache_key)
        if stats is None:
            try:
                stats = {
                    'projects_completed': 100,
                    'happy_clients': Service.objects.count() * 10,
                    'years_experience': 5,
                    'team_members': TeamMember.objects.active().count(),
                    'active_services': Service.objects.count(),
                    'open_positions': JobPosting.objects.active().count(),
                }
                cache.set(cache_key, stats, 60 * 60)
            except Exception as e:
                logger.error(f"Error calculating statistics: {str(e)}")
                stats = self._get_fallback_statistics()
        return stats

    def _get_fallback_statistics(self):
        return {
            'projects_completed': 100,
            'happy_clients': 50,
            'years_experience': 5,
            'team_members': 10,
            'active_services': 6,
            'open_positions': 3,
        }


class ServiceListView(ListView):
    model = Service
    template_name = 'website/services.html'
    context_object_name = 'services'
    paginate_by = 9

    def get_queryset(self):
        queryset = Service.objects.order_by('-created_at')
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(tech_stack__icontains=search_query)
            )
        return queryset


class ServiceDetailView(DetailView):
    model = Service
    template_name = 'website/service_detail.html'
    context_object_name = 'service'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['related_services'] = Service.objects.exclude(
            id=self.object.id
        ).order_by('?')[:3]
        return context


class AboutView(TemplateView):
    template_name = 'website/about.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['team_members'] = TeamMember.objects.active().ordered()
        return context


class CareerListView(ListView):
    model = JobPosting
    template_name = 'website/career_list.html'
    context_object_name = 'jobs'
    paginate_by = 10

    def get_queryset(self):
        queryset = JobPosting.objects.active().order_by('-created_at')
        department = self.request.GET.get('department')
        location = self.request.GET.get('location')
        if department:
            queryset = queryset.filter(department__icontains=department)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'departments': JobPosting.objects.active().values_list('department', flat=True).distinct(),
            'locations': JobPosting.objects.active().values_list('location', flat=True).distinct(),
        })
        return context


class JobDetailView(DetailView):
    model = JobPosting
    template_name = 'website/job_detail.html'
    context_object_name = 'job'

    def get_queryset(self):
        return JobPosting.objects.active()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['related_jobs'] = JobPosting.objects.active().filter(
            department=self.object.department
        ).exclude(id=self.object.id)[:3]
        return context


class ContactView(TemplateView):
    template_name = 'website/contact.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['contact_form'] = ContactForm()
        return context


# Legacy views for backward compatibility (can be deprecated in future)
def home(request): return HomeView.as_view()(request)
def services(request): return ServiceListView.as_view()(request)
def about(request): return AboutView.as_view()(request)
def careers(request): return CareerListView.as_view()(request)
def contact(request): return ContactView.as_view()(request)

@require_GET
def health_check(request):
    return JsonResponse({"status": "ok"})
