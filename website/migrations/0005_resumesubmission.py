# Generated by Django 5.0.1 on 2025-06-29 12:44

import django.core.validators
import website.models
import website.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0004_alter_service_image_alter_teammember_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResumeSubmission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('message', models.TextField()),
                ('resume_file', models.FileField(blank=True, help_text='Resume file (max 5MB, PDF or Word document)', null=True, storage=website.storage.SecureFileStorage(), upload_to='resumes/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']), website.models.validate_file_size])),
                ('resume_link', models.URLField(blank=True, help_text='Link to resume on Google Drive or similar', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_reviewed', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('new', 'New Submission'), ('reviewing', 'Under Review'), ('contacted', 'Contacted'), ('interview', 'Interview Scheduled'), ('rejected', 'Not Selected'), ('hired', 'Hired')], default='new', max_length=20)),
                ('notes', models.TextField(blank=True, help_text='Internal notes about this application')),
            ],
            options={
                'verbose_name': 'Resume Submission',
                'verbose_name_plural': 'Resume Submissions',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['status', 'created_at'], name='website_res_status_d1f577_idx'), models.Index(fields=['is_reviewed'], name='website_res_is_revi_2f02a4_idx'), models.Index(fields=['email'], name='website_res_email_6ab98c_idx')],
            },
        ),
    ]
