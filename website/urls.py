from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views

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
    
    # API endpoints - Custom function-based views
    path('api/contact/', api_views.contact_message, name='api_contact'),
    path('api/health/', api_views.health_check, name='api_health'),
    path('api/homepage/', api_views.homepage_data, name='api_homepage'),
    
    # API endpoints - Additional custom actions
    path('api/services/featured/', api_views.ServiceViewSet.as_view({'get': 'featured'}), name='api_services_featured'),
    path('api/services/stats/', api_views.ServiceViewSet.as_view({'get': 'stats'}), name='api_services_stats'),
    path('api/team/leadership/', api_views.TeamMemberViewSet.as_view({'get': 'leadership'}), name='api_team_leadership'),
    path('api/jobs/recent/', api_views.JobPostingViewSet.as_view({'get': 'recent'}), name='api_jobs_recent'),
    path('api/jobs/departments/', api_views.JobPostingViewSet.as_view({'get': 'departments'}), name='api_jobs_departments'),
    path('api/jobs/locations/', api_views.JobPostingViewSet.as_view({'get': 'locations'}), name='api_jobs_locations'),
    
    # Legacy function-based view redirects (for backward compatibility)
    path('home/', views.home, name='home_legacy'),
    path('services_legacy/', views.services, name='services_legacy'),
    path('about_legacy/', views.about, name='about_legacy'),
    path('careers_legacy/', views.careers, name='careers_legacy'),
    path('contact_legacy/', views.contact, name='contact_legacy'),
]