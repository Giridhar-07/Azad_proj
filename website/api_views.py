from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Service, TeamMember, JobPosting, ContactMessage
from .serializers import (
    ServiceSerializer, 
    ServiceDetailSerializer,
    TeamMemberSerializer, 
    JobPostingSerializer, 
    ContactMessageSerializer,
    HomePageDataSerializer
)

# Configure logging
logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class with configurable page size.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.page_size,
            'results': data
        })


class ContactRateThrottle(AnonRateThrottle):
    """
    Custom throttle for contact form submissions.
    """
    scope = 'contact'
    rate = '5/hour'  # Allow 5 contact submissions per hour


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Enhanced API endpoint for services with filtering, search, and caching.
    
    Provides:
    - List all services with pagination
    - Retrieve individual service details
    - Search services by title, description, or tech stack
    - Filter services by various criteria
    - Cached responses for better performance
    """
    serializer_class = ServiceSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tech_stack']
    filterset_fields = ['price']
    ordering_fields = ['created_at', 'title', 'price']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return optimized queryset with select_related for better performance.
        """
        return Service.objects.select_related().order_by('-created_at')
    
    def get_serializer_class(self):
        """
        Return different serializers for list and detail views.
        """
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceSerializer
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @method_decorator(vary_on_headers('User-Agent'))
    def list(self, request, *args, **kwargs):
        """
        Cached list view for services.
        """
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured services for homepage.
        """
        try:
            featured_services = self.get_queryset()[:3]
            serializer = self.get_serializer(featured_services, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            logger.error(f"Error fetching featured services: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch featured services'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get service statistics.
        """
        try:
            cache_key = 'service_stats'
            stats = cache.get(cache_key)
            
            if stats is None:
                stats = {
                    'total_services': self.get_queryset().count(),
                    'avg_price': self.get_queryset().aggregate(
                        avg_price=models.Avg('price')
                    )['avg_price'] or 0,
                    'latest_service': self.get_queryset().first().title if self.get_queryset().exists() else None
                }
                cache.set(cache_key, stats, 60 * 30)  # Cache for 30 minutes
            
            return Response({'status': 'success', 'data': stats})
        except Exception as e:
            logger.error(f"Error fetching service stats: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch service statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Enhanced API endpoint for team members with filtering and ordering.
    
    Provides:
    - List all active team members
    - Retrieve individual team member details
    - Filter by position or activity status
    - Ordered by display order and name
    """
    serializer_class = TeamMemberSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'position', 'bio']
    filterset_fields = ['position', 'is_active']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']
    
    def get_queryset(self):
        """
        Return only active team members by default.
        """
        return TeamMember.objects.filter(is_active=True).order_by('order', 'name')
    
    @method_decorator(cache_page(60 * 30))  # Cache for 30 minutes
    def list(self, request, *args, **kwargs):
        """
        Cached list view for team members.
        """
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def leadership(self, request):
        """
        Get leadership team members (first 4 by order).
        """
        try:
            leadership = self.get_queryset()[:4]
            serializer = self.get_serializer(leadership, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            logger.error(f"Error fetching leadership team: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch leadership team'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Enhanced API endpoint for job postings with comprehensive filtering.
    
    Provides:
    - List all active job postings
    - Retrieve individual job details
    - Filter by department, location, and activity status
    - Search by title, description, or requirements
    - Ordered by creation date (newest first)
    """
    serializer_class = JobPostingSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'requirements', 'department']
    filterset_fields = ['department', 'location', 'is_active']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return only active job postings by default.
        """
        return JobPosting.objects.filter(is_active=True).order_by('-created_at')
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        """
        Cached list view for job postings.
        """
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent job postings for homepage.
        """
        try:
            recent_jobs = self.get_queryset()[:3]
            serializer = self.get_serializer(recent_jobs, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            logger.error(f"Error fetching recent jobs: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch recent job postings'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def departments(self, request):
        """
        Get list of unique departments.
        """
        try:
            departments = self.get_queryset().values_list(
                'department', flat=True
            ).distinct().order_by('department')
            return Response({
                'status': 'success',
                'data': list(departments)
            })
        except Exception as e:
            logger.error(f"Error fetching departments: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch departments'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """
        Get list of unique locations.
        """
        try:
            locations = self.get_queryset().values_list(
                'location', flat=True
            ).distinct().order_by('location')
            return Response({
                'status': 'success',
                'data': list(locations)
            })
        except Exception as e:
            logger.error(f"Error fetching locations: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch locations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_message(request):
    """
    Enhanced API endpoint for submitting contact messages with validation and rate limiting.
    
    Features:
    - Input validation and sanitization
    - Rate limiting to prevent spam
    - Comprehensive error handling
    - Success/error response formatting
    """
    if request.method == 'POST':
        try:
            # Apply rate limiting
            throttle = ContactRateThrottle()
            if not throttle.allow_request(request, None):
                return Response(
                    {
                        'status': 'error',
                        'message': 'Too many contact submissions. Please try again later.',
                        'retry_after': throttle.wait()
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            serializer = ContactMessageSerializer(data=request.data)
            if serializer.is_valid():
                # Save the contact message
                contact_message = serializer.save()
                
                # Log successful submission
                logger.info(f"Contact message submitted: {contact_message.id} from {contact_message.email}")
                
                return Response(
                    {
                        'status': 'success',
                        'message': 'Your message has been sent successfully. We will get back to you soon!',
                        'data': {
                            'id': contact_message.id,
                            'submitted_at': contact_message.created_at.isoformat()
                        }
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        'status': 'error',
                        'message': 'Please check your input and try again.',
                        'errors': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            logger.error(f"Error processing contact message: {str(e)}")
            return Response(
                {
                    'status': 'error',
                    'message': 'An error occurred while processing your message. Please try again later.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Enhanced API endpoint for health check with system status information.
    
    Returns:
    - API status
    - Database connectivity
    - Cache status
    - Current timestamp
    """
    try:
        # Check database connectivity
        db_status = 'ok'
        try:
            Service.objects.count()
        except Exception as e:
            db_status = f'error: {str(e)}'
            logger.error(f"Database health check failed: {str(e)}")
        
        # Check cache status
        cache_status = 'ok'
        try:
            cache.set('health_check', 'test', 10)
            cache.get('health_check')
        except Exception as e:
            cache_status = f'error: {str(e)}'
            logger.error(f"Cache health check failed: {str(e)}")
        
        return Response(
            {
                'status': 'ok',
                'timestamp': timezone.now().isoformat(),
                'services': {
                    'database': db_status,
                    'cache': cache_status
                },
                'version': '1.0.0'
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response(
            {
                'status': 'error',
                'message': 'Health check failed',
                'timestamp': timezone.now().isoformat()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 15)  # Cache for 15 minutes
def homepage_data(request):
    """
    Comprehensive API endpoint for homepage data aggregation.
    
    Returns all data needed for the homepage in a single request:
    - Featured services
    - Team highlights
    - Recent job postings
    - Company statistics
    - Meta information
    """
    try:
        # Get featured services
        featured_services = Service.objects.order_by('-created_at')[:3]
        
        # Get team highlights
        team_members = TeamMember.objects.filter(is_active=True).order_by('order')[:4]
        
        # Get recent jobs
        recent_jobs = JobPosting.objects.filter(is_active=True).order_by('-created_at')[:3]
        
        # Calculate statistics
        stats = {
            'projects_completed': 100,
            'happy_clients': Service.objects.count() * 10,
            'years_experience': 5,
            'team_members': TeamMember.objects.filter(is_active=True).count(),
            'active_services': Service.objects.count(),
            'open_positions': JobPosting.objects.filter(is_active=True).count(),
        }
        
        # Serialize data
        data = {
            'featured_services': ServiceSerializer(featured_services, many=True).data,
            'team_members': TeamMemberSerializer(team_members, many=True).data,
            'recent_jobs': JobPostingSerializer(recent_jobs, many=True).data,
            'stats': stats,
            'meta': {
                'page_title': 'Welcome to AZAYD - Digital Innovation Hub',
                'description': 'Transform your ideas into digital reality with AZAYD. Expert web development, mobile apps, and AI solutions.',
                'last_updated': timezone.now().isoformat()
            }
        }
        
        return Response(
            {
                'status': 'success',
                'data': data
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        logger.error(f"Error fetching homepage data: {str(e)}")
        return Response(
            {
                'status': 'error',
                'message': 'Unable to fetch homepage data',
                'fallback_data': {
                    'stats': {
                        'projects_completed': 100,
                        'happy_clients': 50,
                        'years_experience': 5,
                        'team_members': 10,
                        'active_services': 6,
                        'open_positions': 3,
                    }
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )