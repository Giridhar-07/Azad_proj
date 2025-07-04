# Generated by Django 5.0.1 on 2025-07-01 06:23

import django.core.validators
import django.db.models.deletion
import website.models
import website.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0005_resumesubmission'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='jobposting',
            options={'ordering': ['-created_at'], 'verbose_name': 'Job Posting', 'verbose_name_plural': 'Job Postings'},
        ),
        migrations.AddField(
            model_name='jobposting',
            name='experience_level',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='jobposting',
            name='job_type',
            field=models.CharField(blank=True, choices=[('full-time', 'Full Time'), ('part-time', 'Part Time'), ('contract', 'Contract'), ('internship', 'Internship'), ('remote', 'Remote')], max_length=50),
        ),
        migrations.AddField(
            model_name='jobposting',
            name='salary_range',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.CreateModel(
            name='JobApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('cover_letter', models.TextField(help_text='Cover letter or additional information')),
                ('resume_file', models.FileField(blank=True, help_text='Resume file (max 5MB, PDF or Word document)', null=True, storage=website.storage.SecureFileStorage(), upload_to='job_applications/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']), website.models.validate_file_size])),
                ('resume_link', models.URLField(blank=True, help_text='Link to resume on Google Drive or similar', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_reviewed', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('new', 'New Application'), ('reviewing', 'Under Review'), ('contacted', 'Contacted'), ('interview', 'Interview Scheduled'), ('rejected', 'Not Selected'), ('hired', 'Hired')], default='new', max_length=20)),
                ('notes', models.TextField(blank=True, help_text='Internal notes about this application')),
                ('email_sent', models.BooleanField(default=False, help_text='Whether confirmation email was sent')),
                ('job', models.ForeignKey(help_text='The job posting this application is for', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='applications', to='website.jobposting')),
            ],
            options={
                'verbose_name': 'Job Application',
                'verbose_name_plural': 'Job Applications',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['status', 'created_at'], name='website_job_status_b14d4c_idx'), models.Index(fields=['is_reviewed'], name='website_job_is_revi_875fd3_idx'), models.Index(fields=['email'], name='website_job_email_8cf512_idx'), models.Index(fields=['job'], name='website_job_job_id_9c8bbb_idx')],
            },
        ),
    ]
