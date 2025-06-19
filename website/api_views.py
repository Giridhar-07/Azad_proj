from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Service, TeamMember, JobPosting, ContactMessage
from .serializers import ServiceSerializer, TeamMemberSerializer, JobPostingSerializer, ContactMessageSerializer

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for services
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for team members
    """
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for job postings
    """
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer

@api_view(['POST'])
def contact_message(request):
    """
    API endpoint for submitting contact messages
    """
    if request.method == 'POST':
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def health_check(request):
    """
    API endpoint for health check
    """
    return Response({"status": "ok"}, status=status.HTTP_200_OK)