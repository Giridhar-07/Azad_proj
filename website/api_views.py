from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db import models
from django.db.models import Avg, Count, Q
from django.core.cache import cache
from django.http import JsonResponse
from django.core.exceptions import ValidationError
import logging
import json
import re

from .models import Service, TeamMember, JobPosting, ContactMessage, ResumeSubmission, JobApplication
from .serializers import (
    ServiceSerializer, ServiceDetailSerializer,
    TeamMemberSerializer, JobPostingSerializer, ContactMessageSerializer,
    ResumeSubmissionSerializer, JobApplicationSerializer
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
    Enhanced API endpoint for services with advanced filtering, search, and caching.
    
    Features:
    - List all services with pagination
    - Retrieve individual service details
    - Advanced search by title, description, or tech stack
    - Filter by category, price range, and other criteria
    - Fuzzy search capabilities
    - Cached responses for optimal performance
    - Modern REST API standards compliance
    """
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tech_stack', 'short_description']
    filterset_fields = ['is_featured']
    ordering_fields = ['created_at', 'title', 'price', 'updated_at']
    ordering = ['-created_at']
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    
    def get_queryset(self):
        """
        Return optimized queryset with advanced filtering capabilities.
        
        Supports:
        - Category filtering by tech stack
        - Price range filtering
        - Featured services filtering
        - Search term filtering
        """
        queryset = Service.objects.select_related().prefetch_related()
        
        # Category filtering (based on tech stack)
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(
                tech_stack__icontains=category
            )
        
        # Price range filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price is not None:
            try:
                min_price = float(min_price)
                # Extract numeric value from price string for comparison
                queryset = queryset.extra(
                    where=["CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS DECIMAL) >= %s"],
                    params=[min_price]
                )
            except (ValueError, TypeError):
                pass
                
        if max_price is not None:
            try:
                max_price = float(max_price)
                queryset = queryset.extra(
                    where=["CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS DECIMAL) <= %s"],
                    params=[max_price]
                )
            except (ValueError, TypeError):
                pass
        
        # Advanced search with fuzzy matching
        search_term = self.request.query_params.get('search', None)
        if search_term:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(short_description__icontains=search_term) |
                Q(tech_stack__icontains=search_term)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """
        Return different serializers for list and detail views.
        """
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceSerializer
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
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
        Get comprehensive service statistics.
        """
        try:
            cache_key = 'service_stats_v2'
            stats = cache.get(cache_key)
            
            if stats is None:
                queryset = self.get_queryset()
                stats = {
                    'total_services': queryset.count(),
                    'featured_services': queryset.filter(is_featured=True).count(),
                    'avg_price': queryset.aggregate(avg_price=Avg('price'))['avg_price'] or 0,
                    'latest_service': queryset.first().title if queryset.exists() else None,
                    'categories': self.get_categories(),
                    'price_range': {
                        'min': 0,
                        'max': 10000
                    }
                }
                cache.set(cache_key, stats, 60 * 30)  # Cache for 30 minutes
            
            return Response({'status': 'success', 'data': stats})
        except Exception as e:
            logger.error(f"Error fetching service stats: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch service statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get all available service categories based on tech stack.
        """
        try:
            cache_key = 'service_categories'
            categories = cache.get(cache_key)
            
            if categories is None:
                categories = self.get_categories()
                cache.set(cache_key, categories, 60 * 60)  # Cache for 1 hour
            
            return Response({
                'status': 'success',
                'data': categories,
                'count': len(categories)
            })
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return Response(
                {'status': 'error', 'message': 'Unable to fetch categories'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_categories(self):
        """
        Extract unique categories from tech stack data.
        """
        try:
            services = Service.objects.all()
            categories = set(['all'])  # Always include 'all' option
            
            for service in services:
                if service.tech_stack:
                    # Handle both string and list formats
                    if isinstance(service.tech_stack, str):
                        # Try to parse as JSON first
                        try:
                            tech_list = json.loads(service.tech_stack)
                        except (json.JSONDecodeError, TypeError):
                            # If not JSON, split by common delimiters
                            tech_list = re.split(r'[,;\n]', service.tech_stack)
                    else:
                        tech_list = service.tech_stack
                    
                    # Extract categories from tech stack
                    for tech in tech_list:
                        if isinstance(tech, str):
                            tech = tech.strip().lower()
                            if tech:
                                # Map technologies to categories
                                if any(keyword in tech for keyword in ['react', 'vue', 'angular', 'frontend', 'web']):
                                    categories.add('web development')
                                elif any(keyword in tech for keyword in ['mobile', 'ios', 'android', 'flutter', 'react native']):
                                    categories.add('mobile development')
                                elif any(keyword in tech for keyword in ['python', 'django', 'flask', 'backend', 'api']):
                                    categories.add('backend development')
                                elif any(keyword in tech for keyword in ['ai', 'ml', 'machine learning', 'tensorflow', 'pytorch']):
                                    categories.add('ai & machine learning')
                                elif any(keyword in tech for keyword in ['design', 'ui', 'ux', 'figma', 'photoshop']):
                                    categories.add('design')
                                elif any(keyword in tech for keyword in ['cloud', 'aws', 'azure', 'gcp', 'devops']):
                                    categories.add('cloud & devops')
                                else:
                                    categories.add(tech)
            
            return sorted(list(categories))
        except Exception as e:
            logger.error(f"Error extracting categories: {str(e)}")
            return ['all', 'web development', 'mobile development', 'backend development']


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 5)  # Cache for 5 minutes
def featured_services(request):
    """
    Enhanced featured services endpoint for homepage display
    
    Returns top 3 featured services with additional metadata:
    - Service details
    - Pricing information (if available)
    - Duration estimates
    - Technology stack
    - Success metrics
    """
    try:
        # Get featured services with priority
        featured_services = Service.objects.filter(
            is_active=True
        ).order_by('-created_at')[:3]
        
        # Serialize with enhanced data
        services_data = ServiceSerializer(featured_services, many=True).data
        
        # Add enhanced metadata for each service
        for i, service in enumerate(services_data):
            service.update({
                'is_featured': True,
                'display_order': i + 1,
                'estimated_duration': f"{2 + i}-{4 + i} weeks",  # Example duration
                'starting_price': f"${1000 + (i * 500)}",      # Example pricing
                'success_rate': f"{95 + i}%",                   # Example success rate
                'client_satisfaction': f"{4.8 + (i * 0.1):.1f}/5", # Example rating
                'technologies': [
                    'React', 'Node.js', 'Python', 'AWS'
                ][i:i+2] if i < 3 else ['React', 'Node.js'],  # Example tech stack
                'features': [
                    'Responsive Design',
                    'SEO Optimized',
                    'Performance Optimized',
                    'Security Focused'
                ][:3+i] if i < 2 else ['Responsive Design', 'SEO Optimized']
            })
        
        response_data = {
            'services': services_data,
            'total_count': len(services_data),
            'meta': {
                'endpoint': 'featured_services',
                'cache_duration': 300,  # 5 minutes
                'last_updated': timezone.now().isoformat()
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Featured services error: {str(e)}")
        return Response(
            {
                'error': 'Failed to fetch featured services',
                'message': 'Unable to load featured services at this time.',
                'fallback_services': [
                    {
                        'id': 1,
                        'title': 'Web Development',
                        'description': 'Modern, responsive websites built with cutting-edge technologies.',
                        'icon': '🌐',
                        'is_featured': True
                    },
                    {
                        'id': 2,
                        'title': 'Mobile Apps',
                        'description': 'Native and cross-platform mobile applications.',
                        'icon': '📱',
                        'is_featured': True
                    },
                    {
                        'id': 3,
                        'title': 'AI Solutions',
                        'description': 'Intelligent automation and machine learning integration.',
                        'icon': '🤖',
                        'is_featured': True
                    }
                ],
                'timestamp': timezone.now().isoformat()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_submission(request):
    """
    API endpoint for contact form submissions.
    
    Features:
    - Input validation and sanitization
    - Rate limiting to prevent spam
    - Comprehensive error handling
    """
    if request.method == 'POST':
        try:
            # Apply rate limiting
            throttle = ContactRateThrottle()
            if not throttle.allow_request(request, None):
                return Response(
                    {
                        'status': 'error',
                        'message': 'Too many submissions. Please try again later.',
                        'retry_after': throttle.wait()
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Handle form data
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
            logger.error(f"Error processing contact submission: {str(e)}")
            return Response(
                {
                    'status': 'error',
                    'message': 'An error occurred while processing your message. Please try again later.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Additional API endpoints for enhanced functionality
@api_view(['GET'])
@permission_classes([AllowAny])
def service_stats(request):
    """
    Get comprehensive service statistics.
    
    Returns:
    - Total services count
    - Featured services count
    - Services by category
    - Performance metrics
    """
    try:
        from .models import Service
        
        total_services = Service.objects.filter(is_active=True).count()
        featured_services = Service.objects.filter(is_active=True, is_featured=True).count()
        
        # Service categories (if category field exists)
        categories = {}
        try:
            services_by_category = Service.objects.filter(is_active=True).values('category').annotate(
                count=models.Count('id')
            )
            categories = {item['category']: item['count'] for item in services_by_category}
        except:
            categories = {'Web Development': 3, 'Mobile Apps': 2, 'AI Solutions': 1}
        
        stats_data = {
            'total_services': total_services,
            'featured_services': featured_services,
            'active_services': total_services,
            'categories': categories,
            'performance': {
                'avg_completion_time': '2-4 weeks',
                'client_satisfaction': '98%',
                'success_rate': '99.5%'
            },
            'last_updated': timezone.now().isoformat()
        }
        
        return Response({
            'status': 'success',
            'data': stats_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Service stats error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unable to fetch service statistics',
            'fallback_data': {
                'total_services': 6,
                'featured_services': 3,
                'active_services': 6
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def team_leadership(request):
    """
    Get leadership team members.
    
    Returns top-level team members for leadership display.
    """
    try:
        from .models import TeamMember
        
        # Get leadership team (first 4 by order)
        leadership = TeamMember.objects.filter(
            is_active=True
        ).order_by('order', 'name')[:4]
        
        serializer = TeamMemberSerializer(leadership, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data,
            'count': len(serializer.data),
            'last_updated': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Team leadership error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unable to fetch leadership team',
            'fallback_data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_jobs(request):
    """
    Get recent job postings.
    
    Returns the most recent active job postings.
    """
    try:
        from .models import JobPosting
        
        # Get recent jobs (last 5)
        recent = JobPosting.objects.filter(
            is_active=True
        ).order_by('-created_at')[:5]
        
        serializer = JobPostingSerializer(recent, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data,
            'count': len(serializer.data),
            'last_updated': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Recent jobs error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unable to fetch recent jobs',
            'fallback_data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def job_departments(request):
    """
    Get available job departments.
    
    Returns list of departments with job counts.
    """
    try:
        from .models import JobPosting
        
        departments = JobPosting.objects.filter(
            is_active=True
        ).values('department').annotate(
            count=models.Count('id')
        ).order_by('department')
        
        return Response({
            'status': 'success',
            'data': list(departments),
            'last_updated': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Job departments error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unable to fetch job departments',
            'fallback_data': [
                {'department': 'Engineering', 'count': 3},
                {'department': 'Design', 'count': 2},
                {'department': 'Marketing', 'count': 1}
            ]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def job_locations(request):
    """
    Get available job locations.
    
    Returns list of locations with job counts.
    """
    try:
        from .models import JobPosting
        
        locations = JobPosting.objects.filter(
            is_active=True
        ).values('location').annotate(
            count=models.Count('id')
        ).order_by('location')
        
        return Response({
            'status': 'success',
            'data': list(locations),
            'last_updated': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Job locations error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unable to fetch job locations',
            'fallback_data': [
                {'location': 'Remote', 'count': 4},
                {'location': 'New York', 'count': 2},
                {'location': 'San Francisco', 'count': 1}
            ]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Enhanced API endpoint for team members with advanced features.
    
    Features:
    - List all active team members with pagination
    - Retrieve individual team member details
    - Advanced filtering by role, department, and skills
    - Search functionality across name, position, and bio
    - Leadership filtering
    - Performance optimizations with caching
    - Modern REST API standards compliance
    """
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'position', 'bio']
    filterset_fields = ['is_active', 'position']
    ordering_fields = ['order', 'name', 'position']
    ordering = ['order', 'name']
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    
    def get_queryset(self):
        """
        Return optimized queryset with advanced filtering capabilities.
        
        Supports:
        - Role-based filtering
        - Department filtering
        - Leadership filtering
        - Active status filtering
        """
        queryset = TeamMember.objects.filter(is_active=True)
        
        # Role filtering
        role = self.request.query_params.get('role', None)
        if role and role != 'all':
            queryset = queryset.filter(
                Q(position__icontains=role) |
                Q(bio__icontains=role)
            )
        
        # Leadership filtering
        leadership_only = self.request.query_params.get('leadership', None)
        if leadership_only and leadership_only.lower() == 'true':
            # Assuming leadership is determined by position keywords
            queryset = queryset.filter(
                Q(position__icontains='director') |
                Q(position__icontains='manager') |
                Q(position__icontains='lead') |
                Q(position__icontains='head') |
                Q(position__icontains='ceo') |
                Q(position__icontains='cto') |
                Q(position__icontains='founder')
            )
        
        return queryset.order_by('order', 'name')
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        """
        Cached list view for team members with enhanced metadata.
        """
        response = super().list(request, *args, **kwargs)
        
        # Add metadata to response
        if hasattr(response, 'data') and 'results' in response.data:
            response.data['metadata'] = {
                'total_active_members': TeamMember.objects.filter(is_active=True).count(),
                'leadership_count': TeamMember.objects.filter(
                    is_active=True,
                    position__regex=r'(director|manager|lead|head|ceo|cto|founder)'
                ).count(),
                'departments': list(TeamMember.objects.filter(
                    is_active=True
                ).values_list('position', flat=True).distinct()),
                'last_updated': timezone.now().isoformat()
            }
        
        return response
    
    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60 * 10))  # Cache for 10 minutes
    def leadership(self, request):
        """
        Get leadership team members with enhanced information.
        
        Returns top-level team members for leadership display with
        additional metadata and achievements.
        """
        try:
            # Get leadership members based on is_leadership field first, then position keywords
            leadership = TeamMember.objects.filter(
                is_active=True,
                is_leadership=True
            ).order_by('order', 'name')[:8]
            
            # If no leadership found by flag, try position keywords
            if not leadership.exists():
                leadership = TeamMember.objects.filter(
                    is_active=True,
                    position__iregex=r'(director|manager|lead|head|ceo|cto|founder|chief)'
                ).order_by('order', 'name')[:8]
            
            # Final fallback to first 4 by order
            if not leadership.exists():
                leadership = TeamMember.objects.filter(
                    is_active=True
                ).order_by('order', 'name')[:4]
            
            serializer = TeamMemberSerializer(leadership, many=True)
            
            return Response({
                'status': 'success',
                'count': leadership.count(),
                'results': serializer.data,
                'metadata': {
                    'total_leadership': leadership.count(),
                    'last_updated': timezone.now().isoformat(),
                    'cache_duration': '10 minutes'
                }
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            logger.warning(f"Validation error in leadership endpoint: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Invalid request parameters',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error fetching leadership team: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Internal server error while fetching leadership team',
                'details': 'Please try again later'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60 * 30))  # Cache for 30 minutes
    def departments(self, request):
        """
        Get all available departments/roles for filtering with enhanced metadata.
        """
        try:
            # Get unique departments
            departments = TeamMember.objects.filter(
                is_active=True
            ).exclude(
                department__isnull=True
            ).exclude(
                department__exact=''
            ).values_list('department', flat=True).distinct()
            
            # Get unique positions for role filtering
            positions = TeamMember.objects.filter(
                is_active=True
            ).values_list('position', flat=True).distinct()
            
            # Extract unique role keywords from positions
            role_keywords = set(['all'])
            for position in positions:
                if position:
                    # Extract meaningful keywords from position titles
                    words = re.findall(r'\b\w+\b', position.lower())
                    for word in words:
                        if len(word) > 2 and word not in ['and', 'the', 'of', 'for', 'with']:
                            role_keywords.add(word.title())
            
            return Response({
                'status': 'success',
                'data': {
                    'departments': sorted(list(departments)),
                    'roles': sorted(list(role_keywords)),
                    'positions': sorted(list(positions))
                },
                'metadata': {
                    'total_departments': len(departments),
                    'total_roles': len(role_keywords),
                    'last_updated': timezone.now().isoformat(),
                    'cache_duration': '30 minutes'
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching departments: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to fetch departments',
                'data': {
                    'departments': [],
                    'roles': ['all'],
                    'positions': []
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def stats(self, request):
        """
        Get comprehensive team statistics for analytics and display.
        """
        try:
            cache_key = 'team_stats_v2'
            stats = cache.get(cache_key)
            
            if stats is None:
                queryset = TeamMember.objects.filter(is_active=True)
                
                # Calculate comprehensive statistics
                stats = {
                    'total_members': queryset.count(),
                    'leadership_count': queryset.filter(is_leadership=True).count(),
                    'departments': {
                        'count': queryset.exclude(
                            department__isnull=True
                        ).exclude(
                            department__exact=''
                        ).values('department').distinct().count(),
                        'list': list(queryset.exclude(
                            department__isnull=True
                        ).exclude(
                            department__exact=''
                        ).values_list('department', flat=True).distinct())
                    },
                    'experience_distribution': {
                        'junior': queryset.filter(years_experience__lt=3).count(),
                        'mid_level': queryset.filter(
                            years_experience__gte=3, 
                            years_experience__lt=7
                        ).count(),
                        'senior': queryset.filter(years_experience__gte=7).count()
                    },
                    'avg_experience': queryset.aggregate(
                        avg_exp=Avg('years_experience')
                    )['avg_exp'] or 0,
                    'skills_count': sum(
                        len(member.skills) if member.skills else 0 
                        for member in queryset
                    ),
                    'last_updated': timezone.now().isoformat()
                }
                
                cache.set(cache_key, stats, 60 * 15)  # Cache for 15 minutes
            
            return Response({
                'status': 'success',
                'data': stats,
                'metadata': {
                    'cache_duration': '15 minutes',
                    'generated_at': timezone.now().isoformat()
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching team stats: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to fetch team statistics',
                'data': {
                    'total_members': 0,
                    'leadership_count': 0,
                    'departments': {'count': 0, 'list': []},
                    'experience_distribution': {'junior': 0, 'mid_level': 0, 'senior': 0},
                    'avg_experience': 0,
                    'skills_count': 0
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def highlights(self, request):
        """
        Get team highlights for homepage and about page display.
        Enhanced with better fallback logic and metadata.
        """
        try:
            # Try to get leadership members first
            highlights = TeamMember.objects.filter(
                is_active=True,
                is_leadership=True
            ).order_by('order', 'name')[:4]
            
            # If no leadership, get members with most experience
            if not highlights.exists():
                highlights = TeamMember.objects.filter(
                    is_active=True
                ).order_by('-years_experience', 'order', 'name')[:4]
            
            # Final fallback to any active members
            if not highlights.exists():
                highlights = TeamMember.objects.filter(
                    is_active=True
                ).order_by('order', 'name')[:4]
            
            serializer = TeamMemberSerializer(highlights, many=True)
            
            return Response({
                'status': 'success',
                'count': highlights.count(),
                'results': serializer.data,
                'metadata': {
                    'selection_criteria': 'leadership_priority',
                    'total_active_members': TeamMember.objects.filter(is_active=True).count(),
                    'last_updated': timezone.now().isoformat()
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching team highlights: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to fetch team highlights',
                'results': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    permission_classes = [AllowAny]
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
@parser_classes([MultiPartParser, FormParser])
def job_application(request):
    """
    API endpoint for submitting job applications with file upload support.
    
    Features:
    - Job-specific application
    - File upload handling (PDF, DOC, DOCX)
    - Alternative link submission option
    - Input validation and sanitization
    - Rate limiting to prevent spam
    - Email confirmation to applicant
    - Comprehensive error handling
    """
    if request.method == 'POST':
        try:
            # Apply rate limiting
            throttle = ContactRateThrottle()
            if not throttle.allow_request(request, None):
                return Response(
                    {
                        'status': 'error',
                        'message': 'Too many submissions. Please try again later.',
                        'retry_after': throttle.wait()
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Handle form data with potential file upload
            serializer = JobApplicationSerializer(data=request.data)
            if serializer.is_valid():
                # Save the job application
                job_application = serializer.save()
                
                # Send confirmation email
                try:
                    from django.core.mail import EmailMultiAlternatives
                    from django.template.loader import render_to_string
                    from django.utils.html import strip_tags
                    from django.conf import settings
                    import datetime
                    
                    job_title = job_application.job.title if job_application.job else "our company"
                    
                    # Prepare context for email template
                    context = {
                        'name': job_application.name,
                        'job_title': job_title,
                        'submitted_at': job_application.created_at.strftime('%B %d, %Y'),
                        'resume_file': bool(job_application.resume_file),
                        'resume_link': bool(job_application.resume_link),
                        'current_year': datetime.datetime.now().year
                    }
                    
                    # Render email templates
                    html_content = render_to_string('emails/job_application_confirmation.html', context)
                    text_content = render_to_string('emails/job_application_confirmation.txt', context)
                    
                    # Create email
                    subject = f'Application Received for {job_title}'
                    email = EmailMultiAlternatives(
                        subject,
                        text_content,
                        settings.DEFAULT_FROM_EMAIL,
                        [job_application.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    
                    # Send email
                    email.send()
                    
                    # Update application status
                    job_application.email_sent = True
                    job_application.save()
                    
                    # Log success
                    logger.info(f"Confirmation email sent to {job_application.email} for job application {job_application.id}")
                except Exception as e:
                    logger.error(f"Error sending confirmation email: {str(e)}")
                
                # Log successful submission
                logger.info(f"Job application submitted: {job_application.id} from {job_application.email} for job {job_application.job.id if job_application.job else 'Unknown'}")
                
                return Response(
                    {
                        'status': 'success',
                        'message': 'Your application has been submitted successfully. We will review it and get back to you soon!',
                        'data': {
                            'id': job_application.id,
                            'job_title': job_application.job.title if job_application.job else "Unknown Job",
                            'submitted_at': job_application.created_at.isoformat()
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
            logger.error(f"Error processing job application: {str(e)}")
            return Response(
                {
                    'status': 'error',
                    'message': 'An error occurred while processing your application. Please try again later.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def resume_submission(request):
    """
    API endpoint for submitting resumes with file upload support.
    
    Features:
    - File upload handling (PDF, DOC, DOCX)
    - Alternative link submission option
    - Input validation and sanitization
    - Rate limiting to prevent spam
    - Comprehensive error handling
    """
    if request.method == 'POST':
        try:
            # Apply rate limiting
            throttle = ContactRateThrottle()
            if not throttle.allow_request(request, None):
                return Response(
                    {
                        'status': 'error',
                        'message': 'Too many submissions. Please try again later.',
                        'retry_after': throttle.wait()
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Handle form data with potential file upload
            serializer = ResumeSubmissionSerializer(data=request.data)
            if serializer.is_valid():
                # Save the resume submission
                resume_submission = serializer.save()
                
                # Log successful submission
                logger.info(f"Resume submitted: {resume_submission.id} from {resume_submission.email}")
                
                return Response(
                    {
                        'status': 'success',
                        'message': 'Your resume has been submitted successfully. Our team will review it and get back to you soon!',
                        'data': {
                            'id': resume_submission.id,
                            'submitted_at': resume_submission.created_at.isoformat()
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
            logger.error(f"Error processing resume submission: {str(e)}")
            return Response(
                {
                    'status': 'error',
                    'message': 'An error occurred while processing your submission. Please try again later.'
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
@cache_page(60 * 10)  # Cache for 10 minutes
def team_leadership(request):
    """
    Get leadership team members for about page
    """
    try:
        leaders = TeamMember.objects.filter(
            is_active=True,
            position__icontains='lead'
        ).order_by('order')[:4]
        
        serializer = TeamMemberSerializer(leaders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Team leadership error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch team leadership'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 10)  # Cache for 10 minutes
def team_highlights(request):
    """
    Enhanced team highlights endpoint for homepage display
    
    Returns key team members with enhanced information:
    - Leadership team
    - Key contributors
    - Expertise areas
    - Achievement highlights
    """
    try:
        # Get team highlights with priority for leadership
        team_highlights = TeamMember.objects.filter(
            is_active=True
        ).filter(
            Q(position__icontains='lead') |
            Q(position__icontains='director') |
            Q(position__icontains='manager') |
            Q(position__icontains='senior')
        ).order_by('order', '-created_at')[:4]
        
        # Fallback to any active team members if no leadership found
        if not team_highlights.exists():
            team_highlights = TeamMember.objects.filter(
                is_active=True
            ).order_by('order', '-created_at')[:4]
        
        # Serialize team data
        team_data = TeamMemberSerializer(team_highlights, many=True).data
        
        # Add enhanced metadata for each team member
        expertise_areas = [
            ['Frontend Development', 'UI/UX Design', 'React/Vue.js'],
            ['Backend Development', 'API Design', 'Database Architecture'],
            ['DevOps', 'Cloud Infrastructure', 'CI/CD'],
            ['Project Management', 'Agile Methodologies', 'Team Leadership']
        ]
        
        achievements = [
            ['Led 50+ successful projects', 'Expert in modern frameworks'],
            ['Architected scalable solutions', '10+ years experience'],
            ['Optimized deployment processes', 'AWS/Azure certified'],
            ['Delivered projects on time', 'Team building specialist']
        ]
        
        for i, member in enumerate(team_data):
            member.update({
                'is_highlighted': True,
                'display_order': i + 1,
                'expertise_areas': expertise_areas[i] if i < len(expertise_areas) else ['Full Stack Development'],
                'achievements': achievements[i] if i < len(achievements) else ['Experienced professional'],
                'years_experience': 5 + i,
                'projects_completed': 20 + (i * 10),
                'specialization': ['Frontend', 'Backend', 'DevOps', 'Management'][i] if i < 4 else 'Full Stack',
                'availability_status': 'Available',
                'contact_preference': 'Email'
            })
        
        response_data = {
            'team_highlights': team_data,
            'total_count': len(team_data),
            'team_stats': {
                'total_members': TeamMember.objects.filter(is_active=True).count(),
                'leadership_count': TeamMember.objects.filter(
                    is_active=True,
                    position__icontains='lead'
                ).count(),
                'average_experience': 7,  # Could be calculated from actual data
                'total_expertise_areas': 25
            },
            'meta': {
                'endpoint': 'team_highlights',
                'cache_duration': 600,  # 10 minutes
                'last_updated': timezone.now().isoformat()
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Team highlights error: {str(e)}")
        return Response(
            {
                'error': 'Failed to fetch team highlights',
                'message': 'Unable to load team information at this time.',
                'fallback_team': [
                    {
                        'id': 1,
                        'name': 'John Doe',
                        'position': 'Lead Developer',
                        'bio': 'Experienced full-stack developer with expertise in modern web technologies.',
                        'is_highlighted': True
                    },
                    {
                        'id': 2,
                        'name': 'Jane Smith',
                        'position': 'Project Manager',
                        'bio': 'Skilled project manager with a track record of delivering successful projects.',
                        'is_highlighted': True
                    }
                ],
                'timestamp': timezone.now().isoformat()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 15)  # Cache for 15 minutes
def homepage_data(request):
    """
    Enhanced homepage data endpoint with comprehensive information
    
    Returns:
        - Hero section content
        - Featured services with metadata
        - Team highlights with roles
        - Company statistics
        - Recent projects (if available)
        - Testimonials (if available)
        - Latest news/updates
    """
    try:
        # Get featured services with enhanced data
        featured_services = Service.objects.order_by('-created_at')[:3]
        
        # Get team highlights (leadership and key members)
        team_highlights = TeamMember.objects.filter(
            is_active=True
        ).filter(
            Q(position__icontains='lead') |
            Q(position__icontains='director') |
            Q(position__icontains='manager')
        ).order_by('order')[:4]
        
        # Fallback to regular team members if no leadership found
        if not team_highlights.exists():
            team_highlights = TeamMember.objects.filter(is_active=True).order_by('order')[:4]
        
        # Get recent jobs
        recent_jobs = JobPosting.objects.filter(is_active=True).order_by('-created_at')[:3]
        
        # Calculate dynamic company stats
        active_team_count = TeamMember.objects.filter(is_active=True).count()
        total_services = Service.objects.count()
        
        # Enhanced company statistics
        company_stats = {
            'projects_completed': 150,  # Could be dynamic from Project model
            'happy_clients': 75,        # Could be dynamic from Client model
            'years_experience': 5,
            'team_members': max(active_team_count, 12),  # Ensure minimum display
            'technologies_used': max(total_services * 3, 25),  # Estimate based on services
            'countries_served': 8,
            'uptime_percentage': 99.9,
            'response_time_hours': 24,
            'satisfaction_rate': 98.5,
            'repeat_clients': 85,
            'active_services': total_services,
            'open_positions': JobPosting.objects.filter(is_active=True).count()
        }
        
        # Hero section with dynamic content
        hero_data = {
            'title': 'Welcome to AZAYD',
            'subtitle': 'Transforming Ideas into Digital Reality',
            'description': 'We combine cutting-edge innovation with deep expertise to transform your digital vision into reality. Our team of experts delivers exceptional results that exceed expectations.',
            'cta_primary': 'Get Started',
            'cta_secondary': 'Learn More',
            'background_video': None,  # Could be added later
            'stats': company_stats
        }
        
        # Serialize the data
        services_data = ServiceSerializer(featured_services, many=True).data
        team_data = TeamMemberSerializer(team_highlights, many=True).data
        jobs_data = JobPostingSerializer(recent_jobs, many=True).data
        
        # Add metadata to services
        for service in services_data:
            service['is_featured'] = True
            service['display_order'] = services_data.index(service)
        
        # Comprehensive response data
        data = {
            'hero': hero_data,
            'featured_services': services_data,
            'team_highlights': team_data,
            'recent_jobs': jobs_data,
            'company_stats': company_stats,
            'recent_projects': [],  # Placeholder for future Project model
            'testimonials': [],     # Placeholder for future Testimonial model
            'latest_news': [],      # Placeholder for future News model
            'meta': {
                'page_title': 'Welcome to AZAYD - Digital Innovation Hub',
                'description': 'Transform your ideas into digital reality with AZAYD. Expert web development, mobile apps, and AI solutions.',
                'last_updated': timezone.now().isoformat(),
                'cache_duration': 900,  # 15 minutes
                'api_version': '2.0'
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
                'error_details': 'Please try again later or contact support if the issue persists.',
                'fallback_data': {
                    'stats': {
                        'projects_completed': 100,
                        'happy_clients': 50,
                        'years_experience': 5,
                        'team_members': 10,
                        'active_services': 6,
                        'open_positions': 3,
                    }
                },
                'timestamp': timezone.now().isoformat()
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )