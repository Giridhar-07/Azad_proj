import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';

interface ResumeFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  resumeType: 'file' | 'link';
  resumeFile?: File | null;
  resumeLink?: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  resumeFile?: string;
  resumeLink?: string;
  message?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const formContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const inputAnimation = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

const ResumeForm: React.FC<ResumeFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    resumeType: 'file',
    resumeFile: null,
    resumeLink: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.resumeType === 'file' && !formData.resumeFile) {
      newErrors.resumeFile = 'Please upload your resume';
    } else if (formData.resumeType === 'file' && formData.resumeFile) {
      const fileExtension = formData.resumeFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pdf' && fileExtension !== 'doc' && fileExtension !== 'docx') {
        newErrors.resumeFile = 'Please upload a PDF or Word document';
      }
    }

    if (formData.resumeType === 'link' && !formData.resumeLink?.trim()) {
      newErrors.resumeLink = 'Please provide a link to your resume';
    } else if (formData.resumeType === 'link' && !formData.resumeLink?.includes('drive.google.com')) {
      newErrors.resumeLink = 'Please provide a valid Google Drive link';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleResumeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resumeType = e.target.value as 'file' | 'link';
    setFormData(prev => ({
      ...prev,
      resumeType,
      // Reset the other field when switching types
      resumeFile: resumeType === 'file' ? prev.resumeFile : null,
      resumeLink: resumeType === 'link' ? prev.resumeLink : ''
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      resumeFile: file
    }));

    // Clear error when user selects a file
    if (errors.resumeFile) {
      setErrors(prev => ({
        ...prev,
        resumeFile: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create FormData object for file upload
      const submissionData = new FormData();
      submissionData.append('name', formData.name);
      submissionData.append('email', formData.email);
      if (formData.phone) submissionData.append('phone', formData.phone);
      submissionData.append('message', formData.message);
      submissionData.append('subject', 'Career Application - Resume Submission');
      
      if (formData.resumeType === 'file' && formData.resumeFile) {
        submissionData.append('resume_file', formData.resumeFile);
      } else if (formData.resumeType === 'link' && formData.resumeLink) {
        submissionData.append('resume_link', formData.resumeLink);
      }

      // Use the existing submitContactForm method but pass FormData instead of JSON
      await apiService.submitResumeForm(submissionData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        resumeType: 'file',
        resumeFile: null,
        resumeLink: '',
        message: ''
      });
      
      // Call the success callback after a short delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting resume form:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-content resume-form-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <motion.button 
          className="modal-close-btn"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <motion.div className="form-header" variants={fadeIn}>
          <h3>Join Our Mission</h3>
          <p>Send us your resume and let's explore how you can contribute to our team!</p>
        </motion.div>
        
        {submitStatus === 'success' && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <i className="fas fa-check-circle"></i>
            Thank you for your application! We'll review your resume and get back to you soon.
          </motion.div>
        )}
        
        {submitStatus === 'error' && (
          <motion.div 
            className="alert alert-error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <i className="fas fa-exclamation-circle"></i>
            Sorry, there was an error submitting your application. Please try again.
          </motion.div>
        )}

        <motion.form 
          className="contact-form"
          onSubmit={handleSubmit}
          variants={formContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="form-row" variants={inputAnimation}>
            <motion.div className="form-group" variants={inputAnimation}>
              <label htmlFor="name">Name *</label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Your full name"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </motion.div>

            <motion.div className="form-group" variants={inputAnimation}>
              <label htmlFor="email">Email *</label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </motion.div>
          </motion.div>

          <motion.div className="form-group" variants={inputAnimation}>
            <label htmlFor="phone">Phone (Optional)</label>
            <motion.input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          <motion.div className="form-group resume-type-selector" variants={inputAnimation}>
            <label>Resume Format *</label>
            <div className="resume-type-options">
              <label className={`resume-type-option ${formData.resumeType === 'file' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="resumeType"
                  value="file"
                  checked={formData.resumeType === 'file'}
                  onChange={handleResumeTypeChange}
                />
                <span className="option-text">Upload File</span>
              </label>
              <label className={`resume-type-option ${formData.resumeType === 'link' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="resumeType"
                  value="link"
                  checked={formData.resumeType === 'link'}
                  onChange={handleResumeTypeChange}
                />
                <span className="option-text">Google Drive Link</span>
              </label>
            </div>
          </motion.div>

          {formData.resumeType === 'file' && (
            <motion.div className="form-group" variants={inputAnimation}>
              <label htmlFor="resumeFile">Upload Resume * (PDF or Word)</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="resumeFile"
                  name="resumeFile"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
                <div className={`file-upload-button ${errors.resumeFile ? 'error' : ''}`}>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline"
                  >
                    <i className="fas fa-upload"></i> Choose File
                  </button>
                  <span className="file-name">
                    {formData.resumeFile ? formData.resumeFile.name : 'No file chosen'}
                  </span>
                </div>
                {errors.resumeFile && <span className="error-message">{errors.resumeFile}</span>}
              </div>
            </motion.div>
          )}

          {formData.resumeType === 'link' && (
            <motion.div className="form-group" variants={inputAnimation}>
              <label htmlFor="resumeLink">Google Drive Link to Resume *</label>
              <motion.input
                type="url"
                id="resumeLink"
                name="resumeLink"
                value={formData.resumeLink}
                onChange={handleInputChange}
                className={errors.resumeLink ? 'error' : ''}
                placeholder="https://drive.google.com/file/d/..."
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {errors.resumeLink && <span className="error-message">{errors.resumeLink}</span>}
            </motion.div>
          )}

          <motion.div className="form-group" variants={inputAnimation}>
            <label htmlFor="message">Cover Message *</label>
            <motion.textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={errors.message ? 'error' : ''}
              placeholder="Tell us about yourself and why you'd like to join our team..."
              rows={4}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            {errors.message && <span className="error-message">{errors.message}</span>}
          </motion.div>

          <motion.div className="form-actions" variants={scaleIn}>
            <motion.button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Submit Application
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default ResumeForm;