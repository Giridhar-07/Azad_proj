import os
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Builds the React frontend application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Building React application...'))
        
        # Get the project root directory
        project_root = settings.BASE_DIR
        
        # Run npm build command
        try:
            self.stdout.write('Running npm build...')
            subprocess.run(['npm', 'run', 'build'], cwd=project_root, check=True)
            self.stdout.write(self.style.SUCCESS('React build completed successfully!'))
        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(f'Error building React application: {e}'))
            return
        
        self.stdout.write(self.style.SUCCESS('React application built successfully!'))