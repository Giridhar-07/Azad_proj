from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from website.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('website.urls')),
    path('health/', health_check, name='health_check'),
    # Serve React app for all other routes
    path('', TemplateView.as_view(template_name='index.html')),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)