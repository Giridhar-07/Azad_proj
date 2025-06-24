import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/about.css';
import TechSphere from '../components/TechSphere';
import { apiService, TeamMember as TeamMemberType } from '../services/api';

// Lazy load components for better performance
const TeamMemberModal = lazy(() => import('../components/TeamMemberModal'));
const CompanyTimeline = lazy(() => import('../components/CompanyTimeline'));
const InteractiveStats = lazy(() => import('../components/InteractiveStats'));

/**
 * Enhanced animation variants following modern motion design principles
 */
const animationVariants = {
  // Page entrance animations
  pageEnter: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1
      }
    }
  },
  
  // Hero section animations
  heroContent: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        staggerChildren: 0.2
      }
    }
  },
  
  // Card animations with 3D effects
  cardHover: {
    rest: { 
      scale: 1, 
      rotateY: 0, 
      rotateX: 0,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      rotateX: 5,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    tap: { scale: 0.98 }
  },
  
  // Stagger container for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Individual list items
  staggerItem: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  },
  
  // Floating animations for decorative elements
  floating: {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

/**
 * Enhanced TypeScript interfaces for better type safety
 */
interface TeamMember extends TeamMemberType {
  skills?: string[];
  years_experience?: number;
  is_leadership?: boolean;
  department?: string;
  achievements?: string[];
}

interface CompanyStats {
  projectsCompleted: number;
  yearsExperience: number;
  teamMembers: number;
  clientSatisfaction: number;
  countriesServed: number;
  technologiesUsed: number;
}

interface AboutPageState {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  activeSection: string;
  selectedMember: TeamMember | null;
  filterRole: string;
  searchTerm: string;
  isRetrying: boolean;
}

/**
 * Enhanced About Page Component with Modern Features
 * 
 * Features:
 * - Interactive team member cards with detailed modals
 * - Real-time search and filtering
 * - Smooth scroll navigation
 * - 3D animations and parallax effects
 * - Responsive design with mobile optimization
 * - Error handling with retry mechanisms
 * - Performance optimizations with lazy loading
 * - SEO-friendly structure
 */
const About: React.FC = () => {
  // Navigation and routing
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Scroll progress tracking
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Spring animations for smooth interactions
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);
  
  // Component state with enhanced type safety
  const [state, setState] = useState<AboutPageState>({
    teamMembers: [],
    loading: true,
    error: null,
    activeSection: 'story',
    selectedMember: null,
    filterRole: 'all',
    searchTerm: '',
    isRetrying: false
  });
  
  // Company statistics with real-time updates
  const companyStats: CompanyStats = useMemo(() => ({
    projectsCompleted: 150,
    yearsExperience: 8,
    teamMembers: state.teamMembers.length || 25,
    clientSatisfaction: 4.9,
    countriesServed: 15,
    technologiesUsed: 30
  }), [state.teamMembers.length]);
  
  // Enhanced filtering with search functionality
  const filteredTeamMembers = useMemo(() => {
    let filtered = state.teamMembers;
    
    // Role-based filtering
    if (state.filterRole !== 'all') {
      filtered = filtered.filter(member => 
        member.position.toLowerCase().includes(state.filterRole.toLowerCase()) ||
        member.department?.toLowerCase().includes(state.filterRole.toLowerCase())
      );
    }
    
    // Search term filtering
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.position.toLowerCase().includes(searchLower) ||
        member.bio.toLowerCase().includes(searchLower) ||
        member.skills?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [state.teamMembers, state.filterRole, state.searchTerm]);
  
  // Get unique roles for filtering
  const availableRoles = useMemo(() => {
    const roles = state.teamMembers.flatMap(member => {
      const roles = [];
      if (member.position) roles.push(member.position.split(' ')[0]);
      if (member.department) roles.push(member.department);
      return roles;
    });
    return ['all', ...Array.from(new Set(roles))];
  }, [state.teamMembers]);
  
  /**
   * Enhanced API integration with comprehensive error handling
   */
  const fetchTeamMembers = useCallback(async (retryCount = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch team members with enhanced error handling
      const members = await apiService.getTeamMembers();
      
      // Validate and enhance data
      const enhancedMembers = members.map(member => ({
        ...member,
        skills: member.skills || [],
        years_experience: member.years_experience || 0,
        is_leadership: member.is_leadership || false,
        department: member.department || 'General',
        achievements: member.achievements || []
      }));
      
      setState(prev => ({
        ...prev,
        teamMembers: enhancedMembers,
        loading: false,
        error: null
      }));
      
    } catch (error) {
      console.error('Error fetching team members:', error);
      
      // Retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          fetchTeamMembers(retryCount + 1);
        }, delay);
        return;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load team members. Please try again later.'
      }));
    }
  }, []);
  
  /**
   * Manual retry function for user-initiated retries
   */
  const handleRetry = useCallback(async () => {
    setState(prev => ({ ...prev, isRetrying: true }));
    await fetchTeamMembers();
    setState(prev => ({ ...prev, isRetrying: false }));
  }, [fetchTeamMembers]);
  
  /**
   * Enhanced section navigation with smooth scrolling
   */
  const navigateToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      setState(prev => ({ ...prev, activeSection: sectionId }));
      
      // Update URL without page reload
      navigate(`/about#${sectionId}`, { replace: true });
    }
  }, [navigate]);
  
  /**
   * Mouse tracking for interactive effects
   */
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    
    mouseX.set((clientX / innerWidth - 0.5) * 20);
    mouseY.set((clientY / innerHeight - 0.5) * 20);
  }, [mouseX, mouseY]);
  
  // Initialize component
  useEffect(() => {
    // Initialize AOS animations
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });
    
    // Fetch initial data
    fetchTeamMembers();
    
    // Handle URL hash navigation
    const hash = location.hash.replace('#', '');
    if (hash) {
      setState(prev => ({ ...prev, activeSection: hash }));
      setTimeout(() => navigateToSection(hash), 100);
    }
    
    // Cleanup
    return () => {
      AOS.refresh();
    };
  }, [location.hash, fetchTeamMembers, navigateToSection]);
  
  // Intersection observers for section tracking
  const heroInView = useInView(heroRef, { threshold: 0.3 });
  const teamInView = useInView(teamRef, { threshold: 0.2 });
  const statsInView = useInView(statsRef, { threshold: 0.3 });
  
  return (
    <motion.div 
      className="about-page"
      initial="hidden"
      animate="visible"
      variants={animationVariants.pageEnter}
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced Hero Section with 3D Background */}
      <motion.section 
        ref={heroRef}
        className="hero-section"
        style={{ y: heroY, opacity: heroOpacity }}
        variants={animationVariants.heroContent}
      >
        <div className="hero-background">
          <Suspense fallback={<div className="loading-3d">Loading 3D Scene...</div>}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <Environment preset="sunset" />
              <OrbitControls enableZoom={false} enablePan={false} />
              <TechSphere />
            </Canvas>
          </Suspense>
        </div>
        
        <motion.div className="hero-content" variants={animationVariants.staggerItem}>
          <motion.div className="hero-text" variants={animationVariants.staggerItem}>
            <motion.h1 
              className="gradient-text"
              variants={animationVariants.staggerItem}
            >
              Innovating the Future
            </motion.h1>
            <motion.p variants={animationVariants.staggerItem}>
              We are a passionate team of technologists, designers, and strategists 
              committed to transforming businesses through cutting-edge digital solutions.
            </motion.p>
          </motion.div>
          
          {/* Interactive Statistics */}
          <Suspense fallback={<div className="loading-stats">Loading Statistics...</div>}>
            <InteractiveStats 
              stats={companyStats}
              inView={heroInView}
              variants={animationVariants.staggerContainer}
            />
          </Suspense>
          
          {/* Navigation Pills */}
          <motion.div 
            className="section-navigation"
            variants={animationVariants.staggerContainer}
          >
            {['story', 'team', 'values', 'timeline'].map((section) => (
              <motion.button
                key={section}
                className={`nav-pill ${state.activeSection === section ? 'active' : ''}`}
                onClick={() => navigateToSection(section)}
                variants={animationVariants.staggerItem}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>
      
      {/* Company Story Section */}
      <motion.section 
        id="story"
        className="story-section"
        variants={animationVariants.staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={animationVariants.staggerItem}>
            <h2>Our Story</h2>
            <p>From humble beginnings to industry leadership</p>
          </motion.div>
          
          <motion.div className="story-content" variants={animationVariants.staggerContainer}>
            <motion.div className="story-text" variants={animationVariants.staggerItem}>
              <h3>Founded on Innovation</h3>
              <p>
                Azayd IT Consulting was born from a simple yet powerful vision: to bridge 
                the gap between cutting-edge technology and real-world business solutions. 
                Our journey began with a small team of passionate developers and has evolved 
                into a comprehensive digital transformation partner.
              </p>
              
              <h3>Our Mission</h3>
              <p>
                We empower businesses to thrive in the digital age by delivering innovative, 
                scalable, and user-centric solutions. Our commitment to excellence and 
                continuous learning drives everything we do.
              </p>
            </motion.div>
            
            <motion.div className="story-visual" variants={animationVariants.staggerItem}>
              <div className="achievement-cards">
                <motion.div 
                  className="achievement-card"
                  variants={animationVariants.cardHover}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <h4>150+</h4>
                  <p>Projects Delivered</p>
                </motion.div>
                <motion.div 
                  className="achievement-card"
                  variants={animationVariants.cardHover}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <h4>98%</h4>
                  <p>Client Satisfaction</p>
                </motion.div>
                <motion.div 
                  className="achievement-card"
                  variants={animationVariants.cardHover}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <h4>15+</h4>
                  <p>Countries Served</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Enhanced Team Section */}
      <motion.section 
        id="team"
        ref={teamRef}
        className="team-section"
        variants={animationVariants.staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={animationVariants.staggerItem}>
            <h2>Meet Our Team</h2>
            <p>The brilliant minds behind our success</p>
          </motion.div>
          
          {/* Enhanced Search and Filter Controls */}
          <motion.div className="team-controls" variants={animationVariants.staggerItem}>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search team members..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <select
                value={state.filterRole}
                onChange={(e) => setState(prev => ({ ...prev, filterRole: e.target.value }))}
                className="filter-select"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
          
          {/* Loading State */}
          {state.loading && (
            <motion.div 
              className="loading-container"
              variants={animationVariants.staggerItem}
            >
              <div className="loading-spinner"></div>
              <p>Loading our amazing team...</p>
            </motion.div>
          )}
          
          {/* Error State with Retry */}
          {state.error && (
            <motion.div 
              className="error-container"
              variants={animationVariants.staggerItem}
            >
              <p className="error-message">{state.error}</p>
              <motion.button
                className="retry-button"
                onClick={handleRetry}
                disabled={state.isRetrying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {state.isRetrying ? 'Retrying...' : 'Try Again'}
              </motion.button>
            </motion.div>
          )}
          
          {/* Team Members Grid */}
          {!state.loading && !state.error && (
            <motion.div 
              className="team-grid"
              variants={animationVariants.staggerContainer}
            >
              <AnimatePresence mode="wait">
                {filteredTeamMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    className="team-member-card"
                    variants={animationVariants.cardHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    layout
                    onClick={() => setState(prev => ({ ...prev, selectedMember: member }))}
                  >
                    <div className="member-image-container">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="member-image"
                        loading="lazy"
                      />
                      {member.is_leadership && (
                        <div className="leadership-badge">Leadership</div>
                      )}
                    </div>
                    
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-position">{member.position}</p>
                      <p className="member-bio">{member.bio.substring(0, 100)}...</p>
                      
                      {member.skills && member.skills.length > 0 && (
                        <div className="member-skills">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="member-social">
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-linkedin"></i>
                          </a>
                        )}
                        {member.twitter_url && (
                          <a href={member.twitter_url} target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                          </a>
                        )}
                        {member.github_url && (
                          <a href={member.github_url} target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-github"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* No Results Message */}
          {!state.loading && !state.error && filteredTeamMembers.length === 0 && (
            <motion.div 
              className="no-results"
              variants={animationVariants.staggerItem}
            >
              <p>No team members found matching your criteria.</p>
              <motion.button
                onClick={() => setState(prev => ({ ...prev, searchTerm: '', filterRole: 'all' }))}
                className="clear-filters-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.section>
      
      {/* Company Values Section */}
      <motion.section 
        id="values"
        className="values-section"
        variants={animationVariants.staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={animationVariants.staggerItem}>
            <h2>Our Values</h2>
            <p>The principles that guide our work and relationships</p>
          </motion.div>
          
          <motion.div className="values-grid" variants={animationVariants.staggerContainer}>
            {[
              {
                icon: '🚀',
                title: 'Innovation',
                description: 'We constantly push boundaries and embrace new technologies to deliver cutting-edge solutions.'
              },
              {
                icon: '🤝',
                title: 'Collaboration',
                description: 'We believe in the power of teamwork and open communication to achieve extraordinary results.'
              },
              {
                icon: '🎯',
                title: 'Excellence',
                description: 'We are committed to delivering the highest quality in everything we do, exceeding expectations.'
              },
              {
                icon: '🌱',
                title: 'Growth',
                description: 'We foster continuous learning and development for our team and our clients.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                variants={animationVariants.cardHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      
      {/* Company Timeline */}
      <motion.section 
        id="timeline"
        className="timeline-section"
        variants={animationVariants.staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={animationVariants.staggerItem}>
            <h2>Our Journey</h2>
            <p>Key milestones in our growth story</p>
          </motion.div>
          
          <Suspense fallback={<div className="loading-timeline">Loading Timeline...</div>}>
            <CompanyTimeline variants={animationVariants.staggerContainer} />
          </Suspense>
        </div>
      </motion.section>
      
      {/* Team Member Detail Modal */}
      <AnimatePresence>
        {state.selectedMember && (
          <Suspense fallback={null}>
            <TeamMemberModal
              member={state.selectedMember}
              onClose={() => setState(prev => ({ ...prev, selectedMember: null }))}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default About;