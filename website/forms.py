from django import forms
from .models import ContactMessage, JobApplication, JobPosting

class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form__input', 'placeholder': 'Your Name'}),
            'email': forms.EmailInput(attrs={'class': 'form__input', 'placeholder': 'Your Email'}),
            'subject': forms.TextInput(attrs={'class': 'form__input', 'placeholder': 'Subject'}),
            'message': forms.Textarea(attrs={'class': 'form__textarea', 'placeholder': 'Your Message', 'rows': 5}),
        }

class JobApplicationForm(forms.ModelForm):
    """Form for job applications with file upload and validation."""
    
    class Meta:
        model = JobApplication
        fields = ['name', 'email', 'phone', 'cover_letter', 'resume_file', 'resume_link']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form__input', 
                'placeholder': 'Your Full Name',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form__input', 
                'placeholder': 'Your Email Address',
                'required': True
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form__input', 
                'placeholder': 'Your Phone Number (Optional)'
            }),
            'cover_letter': forms.Textarea(attrs={
                'class': 'form__textarea', 
                'placeholder': 'Tell us why you\'re interested in this position and why you\'d be a good fit',
                'rows': 6,
                'required': True
            }),
            'resume_file': forms.FileInput(attrs={
                'class': 'form__file',
                'accept': '.pdf,.doc,.docx'
            }),
            'resume_link': forms.URLInput(attrs={
                'class': 'form__input',
                'placeholder': 'https://drive.google.com/your-resume'
            })
        }
    
    def __init__(self, *args, **kwargs):
        self.job = kwargs.pop('job', None)
        super().__init__(*args, **kwargs)
        
        # Make resume_file and resume_link not required in form (we'll validate in clean method)
        self.fields['resume_file'].required = False
        self.fields['resume_link'].required = False
    
    def clean_name(self):
        name = self.cleaned_data.get('name', '').strip()
        if len(name) < 2:
            raise forms.ValidationError('Name must be at least 2 characters long.')
        return name.title()
    
    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        if not email or '@' not in email:
            raise forms.ValidationError('Please provide a valid email address.')
        return email
    
    def clean_cover_letter(self):
        cover_letter = self.cleaned_data.get('cover_letter', '').strip()
        if len(cover_letter) < 10:
            raise forms.ValidationError('Cover letter must be at least 10 characters long.')
        return cover_letter
    
    def clean(self):
        cleaned_data = super().clean()
        resume_file = cleaned_data.get('resume_file')
        resume_link = cleaned_data.get('resume_link', '').strip()
        
        # Validate that either resume_file or resume_link is provided
        if not resume_file and not resume_link:
            raise forms.ValidationError('Either a resume file or a link to a resume must be provided.')
        
        # Validate file size if file is provided
        if resume_file and resume_file.size > 5 * 1024 * 1024:  # 5MB limit
            raise forms.ValidationError('Resume file size must be less than 5MB.')
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        if self.job:
            instance.job = self.job
        instance.status = 'new'
        instance.is_reviewed = False
        if commit:
            instance.save()
        return instance