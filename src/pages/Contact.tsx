import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

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

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await axios.post('/api/contact/', formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero" data-aos="fade-up">
        <div className="container">
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">
            Ready to start your next project? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info" data-aos="fade-right">
              <h2>Let's Start a Conversation</h2>
              <p>
                Whether you have a project in mind, need technical consultation, 
                or just want to say hello, we're here to help.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <p>hello@azayd.com</p>
                    <p>support@azayd.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon - Fri, 9AM - 6PM EST</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Office</h3>
                    <p>123 Innovation Drive</p>
                    <p>Tech City, TC 12345</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Response Time</h3>
                    <p>Within 24 hours</p>
                    <p>Emergency support available</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container" data-aos="fade-left">
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Send us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    Sorry, there was an error sending your message. Please try again.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder="What's this about?"
                  />
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? 'error' : ''}
                    placeholder="Tell us about your project or question..."
                    rows={6}
                  ></textarea>
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item" data-aos="fade-up" data-aos-delay="100">
              <h3>How quickly can you start my project?</h3>
              <p>
                We typically begin new projects within 1-2 weeks of contract signing, 
                depending on our current workload and project complexity.
              </p>
            </div>
            
            <div className="faq-item" data-aos="fade-up" data-aos-delay="200">
              <h3>Do you work with international clients?</h3>
              <p>
                Yes! We work with clients worldwide and are experienced in managing 
                projects across different time zones and cultural contexts.
              </p>
            </div>
            
            <div className="faq-item" data-aos="fade-up" data-aos-delay="300">
              <h3>What's your typical project timeline?</h3>
              <p>
                Project timelines vary based on scope and complexity. Simple websites 
                take 2-4 weeks, while complex applications can take 3-6 months or more.
              </p>
            </div>
            
            <div className="faq-item" data-aos="fade-up" data-aos-delay="400">
              <h3>Do you provide ongoing support?</h3>
              <p>
                Absolutely! We offer various support and maintenance packages to keep 
                your project running smoothly after launch.
              </p>
            </div>
            
            <div className="faq-item" data-aos="fade-up" data-aos-delay="500">
              <h3>What technologies do you specialize in?</h3>
              <p>
                We specialize in modern web technologies including React, Node.js, 
                Python, cloud platforms, and mobile app development.
              </p>
            </div>
            
            <div className="faq-item" data-aos="fade-up" data-aos-delay="600">
              <h3>Can you help with existing projects?</h3>
              <p>
                Yes! We can help improve, maintain, or add features to existing 
                applications, regardless of the original technology stack.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;