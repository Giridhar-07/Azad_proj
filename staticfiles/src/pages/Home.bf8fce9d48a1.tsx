import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { motion, useScroll as useFramerScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import { useInView } from 'react-intersection-observer';
import 'aos/dist/aos.css';

// API and Type Imports
import { apiService } from '../services/api';
import { Service, TeamMember, HomePageData } from '../types/api';
import TechSphere from '../components/TechSphere';

// Simple CountUp component for statistics
const CountUp = ({ start = 0, end = 100, duration = 2.5, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentCount = decimals > 0 
          ? parseFloat((progress * (end - start) + start).toFixed(decimals))
          : Math.floor(progress * (end - start) + start);
        
        countRef.current = currentCount;
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [inView, start, end, duration]);

  return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>;
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const slideIn = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function AnimatedBackground() {
  const { scrollYProgress } = useFramerScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, [0, 1], [0, -1]);

  return (
    <div className="hero-background-placeholder">
      <Canvas className="hero-canvas">
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <TechSphere />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * Enhanced Home Page Component
 * 
 * Features:
 * - Modern React patterns with hooks and TypeScript
 * - Seamless frontend-backend integration
 * - Advanced animations and 3D elements
 * - Responsive design and accessibility
 * - Error handling and loading states
 * - Performance optimizations
 * 
 * @component
 */
const Home: React.FC = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // State management for API data and UI states
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [teamHighlights, setTeamHighlights] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Intersection observer for scroll-based animations
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  
  // Scroll progress for parallax effects
  const { scrollYProgress } = useFramerScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  
  /**
   * Fetch homepage data from API with error handling and retry logic
   */
  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data in parallel for better performance
      const [servicesResponse, teamResponse] = await Promise.allSettled([
        apiService.getFeaturedServices(),
        apiService.getTeamHighlights()
      ]);
      
      // Handle services data
      if (servicesResponse.status === 'fulfilled') {
        setFeaturedServices(servicesResponse.value);
      } else {
        console.warn('Failed to fetch featured services:', servicesResponse.reason);
      }
      
      // Handle team data
      if (teamResponse.status === 'fulfilled') {
        setTeamHighlights(teamResponse.value);
      } else {
        console.warn('Failed to fetch team highlights:', teamResponse.reason);
      }
      
      // Set mock homepage data structure
      setHomeData({
        hero: {
          title: "Welcome to AZAYD",
          subtitle: "Transforming Ideas into Digital Reality",
          description: "We combine cutting-edge innovation with deep expertise to transform your digital vision into reality.",
          cta_primary: "Get Started",
          cta_secondary: "Learn More",
          stats: {
            projects_completed: 100,
            happy_clients: 50,
            years_experience: 5,
            team_members: 12,
            technologies_used: 25,
            countries_served: 8,
            uptime_percentage: 99.9,
            response_time_hours: 24
          }
        },
        featured_services: servicesResponse.status === 'fulfilled' ? servicesResponse.value : [],
        team_highlights: teamResponse.status === 'fulfilled' ? teamResponse.value : [],
        recent_projects: [],
        testimonials: [],
        company_stats: {
          projects_completed: 100,
          happy_clients: 50,
          years_experience: 5,
          team_members: 12,
          technologies_used: 25,
          countries_served: 8,
          uptime_percentage: 99.9,
          response_time_hours: 24
        },
        latest_news: []
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load homepage data';
      setError(errorMessage);
      console.error('Homepage data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);
  
  /**
   * Retry function for failed API calls
   */
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);
  
  /**
   * Navigation handlers for better UX
   */
  const handleGetStarted = useCallback(() => {
    navigate('/contact', { state: { source: 'hero_cta' } });
  }, [navigate]);
  
  const handleLearnMore = useCallback(() => {
    navigate('/about', { state: { source: 'hero_secondary' } });
  }, [navigate]);
  
  const handleServiceClick = useCallback((serviceId: number) => {
    navigate(`/services/${serviceId}`, { state: { source: 'home_preview' } });
  }, [navigate]);
  
  // Initialize component and fetch data
  useEffect(() => {
    // Initialize AOS animations
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
    
    // Fetch homepage data
    fetchHomeData();
  }, [fetchHomeData]);
  
  // Memoized computed values for performance
  const companyStats = useMemo(() => {
    return homeData?.company_stats || {
      projects_completed: 100,
      happy_clients: 50,
      years_experience: 5,
      team_members: 12,
      technologies_used: 25,
      countries_served: 8,
      uptime_percentage: 99.9,
      response_time_hours: 24
    };
  }, [homeData]);
  
  // Error boundary component
  if (error && retryCount >= 3) {
    return (
      <div className="error-boundary">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Loading State */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading amazing content...</p>
          </div>
        </div>
      )}
      
      {/* Error State with Retry */}
      {error && retryCount < 3 && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button onClick={handleRetry} className="btn btn-small btn-outline">
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Hero Section with Parallax */}
      <motion.section 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ scale: heroScale, opacity: heroOpacity }}
      >
        <div className="hero-3d-container">
          <AnimatedBackground />
          <div className="hero-particles"></div>
        </div>
        <motion.div 
          className="hero-content"
          variants={fadeIn}
        >
          <motion.h1 
            className="hero-title"
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {homeData?.hero.title || "Welcome to"} <span className="gradient-text animated-gradient">AZAYD</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {homeData?.hero.subtitle || "Transforming Ideas into"} <span className="typing-text">Digital Reality</span>
          </motion.p>
          <motion.p
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hero-description"
          >
            {homeData?.hero.description || "We combine cutting-edge innovation with deep expertise to transform your digital vision into reality."}
          </motion.p>
          <motion.div 
            className="hero-buttons"
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="btn btn-primary btn-glow"
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(79, 70, 229, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              aria-label="Get started with AZAYD services"
            >
              <span className="btn-text">{homeData?.hero.cta_primary || "Get Started"}</span>
              <span className="btn-icon">→</span>
            </motion.button>
            <motion.button 
              className="btn btn-secondary btn-outline"
              whileHover={{ scale: 1.05, borderColor: 'rgba(79, 70, 229, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLearnMore}
              aria-label="Learn more about AZAYD"
            >
              <span className="btn-text">{homeData?.hero.cta_secondary || "Learn More"}</span>
              <span className="btn-icon">↓</span>
            </motion.button>
          </motion.div>
          
          {/* Dynamic Stats Preview */}
          <motion.div
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="hero-stats"
          >
            <div className="stat-item">
              <CountUp end={companyStats.projects_completed} duration={2} />
              <span>Projects</span>
            </div>
            <div className="stat-item">
              <CountUp end={companyStats.happy_clients} duration={2} />
              <span>Clients</span>
            </div>
            <div className="stat-item">
              <CountUp end={companyStats.years_experience} duration={2} />
              <span>Years</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Enhanced Services Preview with Dynamic Data */}
      <motion.section 
        className="services-preview"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.h2>
          
          {/* Services Grid with Dynamic Content */}
          <div className="services-grid">
            {featuredServices.length > 0 ? (
              featuredServices.slice(0, 3).map((service, index) => (
                <motion.div
                  key={service.id}
                  className="service-card glass-card"
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 15px 35px rgba(31, 38, 135, 0.4)',
                    y: -10
                  }}
                  onClick={() => handleServiceClick(service.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleServiceClick(service.id);
                    }
                  }}
                  aria-label={`Learn more about ${service.title}`}
                >
                  <div className="service-icon service-icon-animated">
                    {service.icon || '🌐'}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    {service.price && (
                      <span className="service-price">From ${service.price}</span>
                    )}
                    {service.duration && (
                      <span className="service-duration">{service.duration}</span>
                    )}
                  </div>
                  <motion.div 
                    className="service-card-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              // Fallback static content when API data is not available
              <>
                <motion.div 
                  className="service-card glass-card"
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 15px 35px rgba(31, 38, 135, 0.4)',
                    y: -10
                  }}
                  onClick={() => navigate('/services')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="service-icon service-icon-animated">🚀</div>
                  <h3>Web Development</h3>
                  <p>Modern, responsive websites built with cutting-edge technologies.</p>
                  <motion.div 
                    className="service-card-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="service-card glass-card"
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 15px 35px rgba(31, 38, 135, 0.4)',
                    y: -10
                  }}
                  onClick={() => navigate('/services')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="service-icon service-icon-animated">📱</div>
                  <h3>Mobile Apps</h3>
                  <p>Native and cross-platform mobile applications for iOS and Android.</p>
                  <motion.div 
                    className="service-card-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="service-card glass-card"
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 15px 35px rgba(31, 38, 135, 0.4)',
                    y: -10
                  }}
                  onClick={() => navigate('/services')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="service-icon service-icon-animated">🤖</div>
                  <h3>AI Solutions</h3>
                  <p>Intelligent systems and machine learning solutions for your business.</p>
                  <motion.div 
                    className="service-card-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>
          
          {/* View All Services Link */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            className="section-cta"
          >
            <Link 
              to="/services" 
              className="btn btn-primary btn-large"
              state={{ source: 'home_services_preview' }}
            >
              View All Services
              <span className="btn-icon">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* About Preview */}
      <motion.section 
        className="about-preview"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container glass-card">
          <div className="about-content">
            <motion.div 
              className="about-text"
              variants={fadeIn}
            >
              <motion.h2 
                className="section-title gradient-text"
                variants={slideIn}
              >
                Why Choose AZAYD?
              </motion.h2>
              <motion.p 
                variants={fadeIn}
                className="section-description"
              >
                We combine cutting-edge innovation with deep expertise to transform your digital vision into reality. 
                Our passionate team of developers and designers creates solutions that drive real business value.
              </motion.p>
              <motion.div 
                className="feature-grid"
                variants={staggerContainer}
              >
                <motion.div className="feature-card" variants={scaleIn}>
                  <div className="feature-icon feature-icon-animated">✨</div>
                  <h3>Innovation First</h3>
                  <p>Leveraging cutting-edge technology to build future-proof solutions</p>
                  <motion.div 
                    className="feature-card-progress"
                    initial={{ width: 0 }}
                    whileInView={{ width: '90%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
                <motion.div className="feature-card" variants={scaleIn}>
                  <div className="feature-icon feature-icon-animated">🎯</div>
                  <h3>Result Driven</h3>
                  <p>Focused on delivering measurable business outcomes</p>
                  <motion.div 
                    className="feature-card-progress"
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
                <motion.div className="feature-card" variants={scaleIn}>
                  <div className="feature-icon feature-icon-animated">🤝</div>
                  <h3>Collaborative</h3>
                  <p>Working closely with you throughout the development journey</p>
                  <motion.div 
                    className="feature-card-progress"
                    initial={{ width: 0 }}
                    whileInView={{ width: '95%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
                <motion.div className="feature-card" variants={scaleIn}>
                  <div className="feature-icon feature-icon-animated">⚡</div>
                  <h3>Swift Delivery</h3>
                  <p>Rapid development without compromising on quality</p>
                  <motion.div 
                    className="feature-card-progress"
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="about-visual"
              variants={scaleIn}
            >
              {/* Enhanced Stats Grid with Dynamic Data */}
              <div className="stats-grid">
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="stat-icon">🚀</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.projects_completed} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Projects Completed</div>
                  <div className="stat-description">Successfully delivered projects</div>
                </motion.div>
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="stat-icon">😊</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.happy_clients} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Happy Clients</div>
                  <div className="stat-description">Satisfied customers worldwide</div>
                </motion.div>
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="stat-icon">⭐</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.years_experience} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Years Experience</div>
                  <div className="stat-description">Industry expertise</div>
                </motion.div>
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="stat-icon">🛠️</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.technologies_used} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Technologies</div>
                  <div className="stat-description">Cutting-edge tools</div>
                </motion.div>
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="stat-icon">🌍</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.countries_served} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Countries Served</div>
                  <div className="stat-description">Global reach</div>
                </motion.div>
                <motion.div 
                  className="stat-item glass-card" 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="stat-icon">⚡</div>
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={companyStats.uptime_percentage} duration={2.5} decimals={1} suffix="%" />
                  </motion.div>
                  <div className="stat-label">Uptime</div>
                  <div className="stat-description">Reliable service</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section with Dynamic Content */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="cta-particles"></div>
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Ready to Transform Your Ideas?
            </motion.h2>
            <motion.p 
              className="cta-description"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Let's collaborate to bring your vision to life with our expertise in web development, mobile apps, and AI solutions.
            </motion.p>
            
            {/* CTA Buttons with Enhanced Functionality */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="cta-buttons"
            >
              <motion.button 
                className="btn btn-light btn-large btn-glow"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 0 25px rgba(255, 255, 255, 0.5)' 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                aria-label="Start your project with AZAYD"
              >
                <span className="btn-text">Get Started Today</span>
                <motion.span 
                  className="btn-icon"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                >
                  →
                </motion.span>
              </motion.button>
              
              <motion.button
                className="btn btn-outline btn-large"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                aria-label="Learn more about AZAYD"
              >
                Our Story
                <span className="btn-icon">📖</span>
              </motion.button>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="cta-contact-info"
            >
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">azayd8752@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">⏰</span>
                <span className="contact-text">24/7 Support Available</span>
              </div>
            </motion.div>
            
            {/* Social Proof */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="cta-social-proof"
            >
              <p className="social-proof-text">
                Trusted by <strong>{companyStats.happy_clients}+</strong> companies worldwide
              </p>
              <div className="trust-indicators">
                <span className="trust-badge">⭐ 5.0 Rating</span>
                <span className="trust-badge">🏆 Award Winning</span>
                <span className="trust-badge">🔒 Secure & Reliable</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;