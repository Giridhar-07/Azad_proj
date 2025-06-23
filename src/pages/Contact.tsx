import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { apiService, ContactMessage } from '../services/api';
import '../styles/contact.css';
import TechSphere from '../components/TechSphere';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
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

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: 'easeOut'
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
  const [activeSection, setActiveSection] = useState('hero');

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
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
      await apiService.submitContactForm(formData);
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
      {/* Enhanced Hero Section with 3D Sphere */}
      <motion.section 
        ref={heroRef}
        className="contact-hero"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="hero-background">
          <Canvas className="hero-canvas">
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <TechSphere />
              <Environment preset="city" />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
          </Canvas>
        </div>
        
        <motion.div 
          className="hero-content"
          style={{ y, opacity }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={fadeInUp}>
            <span className="badge-icon">💬</span>
            <span className="badge-text">Let's Connect</span>
          </motion.div>
          
          <motion.h1 className="hero-title" variants={fadeInUp}>
            Get in <span className="gradient-text">Touch</span>
          </motion.h1>
          
          <motion.p className="hero-description" variants={fadeInUp}>
            Ready to bring your ideas to life? Let's start a conversation about your next project.
          </motion.p>
          
          <motion.div className="hero-stats" variants={staggerContainer}>
            <motion.div className="stat-item" variants={scaleIn}>
              <span className="stat-number">24h</span>
              <span className="stat-label">Response Time</span>
            </motion.div>
            <motion.div className="stat-item" variants={scaleIn}>
              <span className="stat-number">500+</span>
              <span className="stat-label">Projects Delivered</span>
            </motion.div>
            <motion.div className="stat-item" variants={scaleIn}>
              <span className="stat-number">98%</span>
              <span className="stat-label">Client Satisfaction</span>
            </motion.div>
          </motion.div>
          
          <motion.div className="hero-actions" variants={staggerContainer}>
            <motion.button 
              className="btn btn-primary"
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Start a Project</span>
              <i className="fas fa-arrow-right"></i>
            </motion.button>
            <motion.button 
              className="btn btn-outline"
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>View Contact Info</span>
              <i className="fas fa-info-circle"></i>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Enhanced Contact Content */}
      <motion.section 
        className="contact-content"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <div className="section-badge">
              <span className="badge-icon">📞</span>
              <span className="badge-text">Contact Information</span>
            </div>
            <h2 className="section-title">Multiple Ways to <span className="gradient-text">Connect</span></h2>
            <p className="section-subtitle">
              Choose the communication method that works best for you. We're here to help bring your vision to life.
            </p>
          </motion.div>
          
          <div className="contact-grid">
            {/* Contact Information */}
            <motion.div 
              id="contact-info"
              className="contact-info" 
              variants={fadeInLeft}
            >
              <div className="info-header">
                <h3>Let's Start a Conversation</h3>
                <p>
                  Whether you have a project in mind, need technical consultation, 
                  or just want to say hello, we're here to help.
                </p>
              </div>

              <motion.div className="contact-methods" variants={staggerContainer}>
                <motion.div 
                  className="contact-method"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Email</h4>
                    <p>hello@azayd.com</p>
                    <p>support@azayd.com</p>
                  </div>
                  <div className="contact-action">
                    <a href="mailto:hello@azayd.com" className="contact-link">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="contact-method"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon - Fri, 9AM - 6PM EST</p>
                  </div>
                  <div className="contact-action">
                    <a href="tel:+15551234567" className="contact-link">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="contact-method"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Office</h4>
                    <p>123 Innovation Drive</p>
                    <p>Tech City, TC 12345</p>
                  </div>
                  <div className="contact-action">
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="contact-method"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="contact-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Response Time</h4>
                    <p>Within 24 hours</p>
                    <p>Emergency support available</p>
                  </div>
                  <div className="contact-action">
                    <div className="status-indicator">
                      <span className="status-dot"></span>
                      <span className="status-text">Online</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div className="social-links" variants={fadeInUp}>
                <h4>Follow Our Journey</h4>
                <motion.div className="social-icons" variants={staggerContainer}>
                  <motion.a 
                    href="#" 
                    className="social-link" 
                    aria-label="LinkedIn"
                    variants={scaleIn}
                    whileHover={{ scale: 1.2, rotateZ: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className="fab fa-linkedin"></i>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-link" 
                    aria-label="Twitter"
                    variants={scaleIn}
                    whileHover={{ scale: 1.2, rotateZ: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className="fab fa-twitter"></i>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-link" 
                    aria-label="GitHub"
                    variants={scaleIn}
                    whileHover={{ scale: 1.2, rotateZ: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className="fab fa-github"></i>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-link" 
                    aria-label="Instagram"
                    variants={scaleIn}
                    whileHover={{ scale: 1.2, rotateZ: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className="fab fa-instagram"></i>
                  </motion.a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Contact Form */}
            <motion.div 
              id="contact-form"
              className="contact-form-container" 
              variants={fadeInRight}
            >
              <motion.form 
                className="contact-form" 
                onSubmit={handleSubmit}
                variants={formContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="form-header" variants={fadeInUp}>
                  <h3>Send us a Message</h3>
                  <p>Ready to start your project? Fill out the form below and we'll get back to you within 24 hours.</p>
                </motion.div>
                
                {submitStatus === 'success' && (
                  <motion.div 
                    className="alert alert-success"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <i className="fas fa-check-circle"></i>
                    Thank you for your message! We'll get back to you soon.
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
                    Sorry, there was an error sending your message. Please try again.
                  </motion.div>
                )}

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
                  <label htmlFor="subject">Subject *</label>
                  <motion.input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder="What's this about?"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </motion.div>

                <motion.div className="form-group" variants={inputAnimation}>
                  <label htmlFor="message">Message *</label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? 'error' : ''}
                    placeholder="Tell us about your project or question..."
                    rows={6}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </motion.div>

                <motion.button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isSubmitting}
                  variants={scaleIn}
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
                      Send Message
                    </>
                  )}
                </motion.button>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced FAQ Section */}
      <motion.section 
        className="faq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <div className="section-badge">
              <span className="badge-icon">❓</span>
              <span className="badge-text">FAQ</span>
            </div>
            <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
            <p className="section-subtitle">
              Find answers to common questions about our services, process, and how we can help your business grow.
            </p>
          </motion.div>
          
          <motion.div className="faq-grid" variants={staggerContainer}>
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>How quickly can you start my project?</h4>
              <p>
                We typically begin new projects within 1-2 weeks of contract signing, 
                depending on our current workload and project complexity.
              </p>
            </motion.div>
            
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-globe"></i>
              </div>
              <h4>Do you work with international clients?</h4>
              <p>
                Yes! We work with clients worldwide and are experienced in managing 
                projects across different time zones and cultural contexts.
              </p>
            </motion.div>
            
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h4>What's your typical project timeline?</h4>
              <p>
                Project timelines vary based on scope and complexity. Simple websites 
                take 2-4 weeks, while complex applications can take 3-6 months or more.
              </p>
            </motion.div>
            
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h4>Do you provide ongoing support?</h4>
              <p>
                Absolutely! We offer various support and maintenance packages to keep 
                your project running smoothly after launch.
              </p>
            </motion.div>
            
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-code"></i>
              </div>
              <h4>What technologies do you specialize in?</h4>
              <p>
                We specialize in modern web technologies including React, Node.js, 
                Python, cloud platforms, and mobile app development.
              </p>
            </motion.div>
            
            <motion.div 
              className="faq-item" 
              variants={scaleIn}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="faq-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h4>Can you help with existing projects?</h4>
              <p>
                Yes! We can help improve, maintain, or add features to existing 
                applications, regardless of the original technology stack.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact;