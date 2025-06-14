from django import forms
from .models import ContactMessage

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