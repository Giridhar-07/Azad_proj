import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/jobApplication.css';

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_file: File | null;
  resume_link: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  cover_letter?: string;
  resume?: string;
  general?: string;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, jobTitle }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume_file: null,
    resume_link: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume_file: file }));
    setFileName(file ? file.name : '');
    
    // Clear resume error when user selects a file
    if (errors.resume) {
      setErrors(prev => ({ ...prev, resume: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = 'Cover letter is required';
    } else if (formData.cover_letter.trim().length < 10) {
      newErrors.cover_letter = 'Cover letter must be at least 10 characters';
    }
    
    if (!formData.resume_file && !formData.resume_link.trim()) {
      newErrors.resume = 'Please provide either a resume file or a link to your resume';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('job_id', jobId.toString());
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone || '');
      submitData.append('cover_letter', formData.cover_letter);
      
      if (formData.resume_file) {
        submitData.append('resume_file', formData.resume_file);
      }
      
      if (formData.resume_link) {
        submitData.append('resume_link', formData.resume_link);
      }
      
      const response = await apiService.submitJobApplication(submitData);
      
      if (response.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          cover_letter: '',
          resume_file: null,
          resume_link: ''
        });
        setFileName('');
      } else {
        // Handle API validation errors
        if (response.errors) {
          const apiErrors: FormErrors = {};
          Object.entries(response.errors).forEach(([key, value]) => {
            apiErrors[key as keyof FormErrors] = Array.isArray(value) ? value[0] : value as string;
          });
          setErrors(apiErrors);
        } else {
          setSubmitError(response.message || 'Failed to submit application. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/careers');
  };

  if (submitSuccess) {
    return (
      <div className={`job-application-success ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Application Submitted!</h2>
        <p>Thank you for applying for the <strong>{jobTitle}</strong> position.</p>
        <p>We have sent a confirmation email to your provided email address. We will review your application and get back to you soon!</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Careers
        </button>
      </div>
    );
  }

  return (
    <div className={`job-application-form-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <h2>Apply for {jobTitle}</h2>
      
      {submitError && (
        <div className="error-message">
          <p>{submitError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="job-application-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className={errors.email ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number (optional)"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cover_letter">Cover Letter *</label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            value={formData.cover_letter}
            onChange={handleInputChange}
            placeholder="Tell us why you're interested in this position and why you'd be a good fit"
            rows={6}
            className={errors.cover_letter ? 'error' : ''}
            disabled={isSubmitting}
          ></textarea>
          {errors.cover_letter && <span className="error-text">{errors.cover_letter}</span>}
        </div>
        
        <div className="form-group resume-section">
          <label>Resume *</label>
          <p className="resume-help-text">Please upload your resume or provide a link to it</p>
          
          <div className="resume-upload">
            <input
              type="file"
              id="resume_file"
              name="resume_file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
            <div className="file-input-container">
              <button 
                type="button" 
                className="file-select-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Select File
              </button>
              <span className="file-name">{fileName || 'No file selected'}</span>
            </div>
            <p className="file-format-text">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
          </div>
          
          <div className="resume-link">
            <label htmlFor="resume_link">Or provide a link to your resume</label>
            <input
              type="url"
              id="resume_link"
              name="resume_link"
              value={formData.resume_link}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/your-resume"
              disabled={isSubmitting}
            />
          </div>
          
          {errors.resume && <span className="error-text">{errors.resume}</span>}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;