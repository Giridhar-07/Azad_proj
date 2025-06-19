from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HomeView, ServiceListView, ServiceDetailView, AboutView, CareerListView, ContactView
from .api_views import ServiceViewSet, TeamMemberViewSet, JobPostingViewSet, contact_message, health_check

app_name = 'website'

# Create a router for the API viewsets
router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'team', TeamMemberViewSet)
router.register(r'jobs', JobPostingViewSet)

urlpatterns = [
    # Traditional Django views for server-rendered pages
    path('', HomeView.as_view(), name='home'),
    path('services/', ServiceListView.as_view(), name='services'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service_detail'),
    path('about/', AboutView.as_view(), name='about'),
    path('careers/', CareerListView.as_view(), name='careers'),
    path('contact/', ContactView.as_view(), name='contact'),
    
    # API endpoints for React frontend
    path('', include(router.urls)),
    path('contact/', contact_message, name='api_contact'),
    path('health/', health_check, name='api_health'),
]