from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views, api_proxy

# API Router for DRF ViewSets
router = DefaultRouter()
router.register(r'services', api_views.ServiceViewSet, basename='service')
router.register(r'team', api_views.TeamMemberViewSet, basename='team')
router.register(r'jobs', api_views.JobPostingViewSet, basename='job')

# App name for namespacing
app_name = 'website'

urlpatterns = [
    # Traditional Django views (for server-rendered pages)
    path('', views.HomeView.as_view(), name='home'),
    path('services/', views.ServiceListView.as_view(), name='services'),
    path('services/<slug:slug>/', views.ServiceDetailView.as_view(), name='service_detail'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('careers/', views.CareerListView.as_view(), name='careers'),
    path('careers/<slug:slug>/', views.JobDetailView.as_view(), name='job_detail'),
    path('contact/', views.ContactView.as_view(), name='contact'),
    
    # API endpoints - Core ViewSets
    path('api/', include(router.urls)),
    
    # Enhanced API endpoints for modern frontend integration
    path('api/contact/', api_views.contact_submission, name='api_contact'),
    path('api/contact/resume/', api_views.resume_submission, name='api_resume'),
    path('api/jobs/apply/', api_views.job_application, name='api_job_application'),
    path('api/health/', api_views.health_check, name='api_health'),
    path('api/homepage/', api_views.homepage_data, name='api_homepage'),
    
    # Featured content endpoints
    path('api/services/featured/', api_views.featured_services, name='api_featured_services'),
    path('api/team/highlights/', api_views.team_highlights, name='api_team_highlights'),
    
    # Specific data endpoints
    path('api/services/stats/', api_views.service_stats, name='api_service_stats'),
    path('api/team/leadership/', api_views.team_leadership, name='api_team_leadership'),
    path('api/jobs/recent/', api_views.recent_jobs, name='api_recent_jobs'),
    path('api/jobs/departments/', api_views.job_departments, name='api_job_departments'),
    path('api/jobs/locations/', api_views.job_locations, name='api_job_locations'),
    
    # API proxy endpoints for secure third-party API access
    path('api/proxy/gemini/', api_proxy.gemini_api_proxy, name='gemini_api_proxy'),
    
    # Legacy function-based view redirects (for backward compatibility)
    path('home/', views.home, name='home_legacy'),
    path('services_legacy/', views.services, name='services_legacy'),
    path('about_legacy/', views.about, name='about_legacy'),
    path('careers_legacy/', views.careers, name='careers_legacy'),
    path('contact_legacy/', views.contact, name='contact_legacy'),
]