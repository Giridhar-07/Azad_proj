from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView
from django.contrib import messages
from .models import Service, JobPosting, TeamMember, ContactMessage
from .forms import ContactForm

class HomeView(TemplateView):
    template_name = 'website/home.html'

class ServiceListView(ListView):
    model = Service
    template_name = 'website/services.html'
    context_object_name = 'services'

class ServiceDetailView(DetailView):
    model = Service
    template_name = 'website/service_detail.html'
    context_object_name = 'service'

class AboutView(TemplateView):
    template_name = 'website/about.html'

class CareerListView(ListView):
    model = JobPosting
    template_name = 'website/career_list.html'
    context_object_name = 'jobs'

class JobDetailView(DetailView):
    model = JobPosting
    template_name = 'website/job_detail.html'
    context_object_name = 'job'

class ContactView(TemplateView):
    template_name = 'website/contact.html'

def home(request):
    return render(request, 'website/home.html')

def services(request):
    return render(request, 'website/services.html')

def about(request):
    return render(request, 'website/about.html')

def careers(request):
    return render(request, 'website/careers.html')

def contact(request):
    return render(request, 'website/contact.html')