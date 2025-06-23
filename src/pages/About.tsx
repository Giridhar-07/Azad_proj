import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/about.css';
import TechSphere from '../components/TechSphere';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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
      type: 'spring',
      stiffness: 100,
      damping: 15
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
import { apiService, TeamMember as TeamMemberType } from '../services/api';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
}

const About: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('story');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const data = await apiService.getTeamMembers();
      setTeamMembers(data);
    } catch (err) {
      // Fallback data for development if apiService also fails
      setTeamMembers([
        {
          id: 1,
          name: 'Alex Johnson',
          position: 'CEO & Founder',
          bio: 'Visionary leader with 10+ years of experience in tech innovation and business development.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 2,
          name: 'Sarah Chen',
          position: 'CTO',
          bio: 'Technical expert specializing in full-stack development and system architecture.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 3,
          name: 'Mike Rodriguez',
          position: 'Lead Designer',
          bio: 'Creative designer focused on user experience and modern interface design.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 4,
          name: 'Emily Davis',
          position: 'Project Manager',
          bio: 'Experienced project manager ensuring smooth delivery and client satisfaction.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-page">
      {/* Enhanced Hero Section with 3D */}
      <motion.section 
        ref={heroRef}
        className="about-hero"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        style={{ y, opacity }}
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
        <div className="container hero-content">
          <motion.div className="hero-text" variants={staggerContainer}>
            <motion.span className="hero-badge" variants={fadeInUp}>
              🚀 Innovation Driven
            </motion.span>
            <motion.h1 
              className="hero-title"
              variants={fadeInUp}
            >
              Crafting Digital
              <span className="gradient-text"> Excellence</span>
            </motion.h1>
            <motion.p 
              className="hero-description"
              variants={fadeInUp}
            >
              We are a team of passionate innovators, designers, and developers 
              dedicated to transforming ideas into extraordinary digital experiences.
            </motion.p>
            <motion.div className="hero-stats" variants={fadeInUp}>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Projects Delivered</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Team Members</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </motion.section>

      {/* Enhanced Company Story */}
      <motion.section 
        className="company-story"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Our Journey</span>
            <h2 className="section-title">The Story Behind AZAYD</h2>
            <p className="section-subtitle">
              From a small startup to a leading digital innovation company
            </p>
          </motion.div>
          
          <div className="story-content">
            <motion.div className="story-text" variants={fadeInLeft}>
              <div className="story-card">
                <div className="story-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  Founded in 2019, AZAYD began as a small team of developers with a big vision: 
                  to bridge the gap between cutting-edge technology and practical business solutions. 
                  What started as a passion project has grown into a full-service digital agency 
                  serving clients worldwide.
                </p>
              </div>
              
              <div className="story-card">
                <div className="story-icon">💡</div>
                <h3>Our Philosophy</h3>
                <p>
                  We believe that technology should empower businesses, not complicate them. 
                  That's why we focus on creating solutions that are not only technically excellent 
                  but also user-friendly and business-focused.
                </p>
              </div>
              
              <div className="story-card">
                <div className="story-icon">🌟</div>
                <h3>Our Vision</h3>
                <p>
                  To be the leading force in digital transformation, helping businesses 
                  navigate the future with innovative, scalable, and sustainable solutions.
                </p>
              </div>
            </motion.div>
            
            <motion.div className="story-visual" variants={fadeInRight}>
              <div className="timeline">
                <motion.div className="timeline-item" variants={scaleIn}>
                  <div className="timeline-year">2019</div>
                  <div className="timeline-content">
                    <div className="timeline-icon">🚀</div>
                    <h4>Company Founded</h4>
                    <p>Started with a vision to innovate and transform digital experiences</p>
                  </div>
                </motion.div>
                
                <motion.div className="timeline-item" variants={scaleIn}>
                  <div className="timeline-year">2020</div>
                  <div className="timeline-content">
                    <div className="timeline-icon">🎯</div>
                    <h4>First Major Client</h4>
                    <p>Delivered our first enterprise solution, establishing our reputation</p>
                  </div>
                </motion.div>
                
                <motion.div className="timeline-item" variants={scaleIn}>
                  <div className="timeline-year">2022</div>
                  <div className="timeline-content">
                    <div className="timeline-icon">👥</div>
                    <h4>Team Expansion</h4>
                    <p>Grew to a team of 15+ professionals across multiple disciplines</p>
                  </div>
                </motion.div>
                
                <motion.div className="timeline-item" variants={scaleIn}>
                  <div className="timeline-year">2024</div>
                  <div className="timeline-content">
                    <div className="timeline-icon">🤖</div>
                    <h4>AI Integration</h4>
                    <p>Leading the way in AI-powered solutions and next-gen technologies</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Values Section */}
      <motion.section 
        className="values-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Core Values</span>
            <h2 className="section-title">What Drives Us Forward</h2>
            <p className="section-subtitle">
              Our fundamental principles that guide every decision and action
            </p>
          </motion.div>
          
          <motion.div className="values-grid" variants={staggerContainer}>
            <motion.div 
              className="value-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="value-icon-wrapper">
                <div className="value-icon">🎯</div>
              </div>
              <h3>Excellence</h3>
              <p>We strive for perfection in every project, ensuring the highest quality deliverables that exceed expectations.</p>
              <div className="value-highlight"></div>
            </motion.div>
            
            <motion.div 
              className="value-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="value-icon-wrapper">
                <div className="value-icon">🤝</div>
              </div>
              <h3>Collaboration</h3>
              <p>We work closely with our clients as partners, fostering transparent communication and shared success.</p>
              <div className="value-highlight"></div>
            </motion.div>
            
            <motion.div 
              className="value-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="value-icon-wrapper">
                <div className="value-icon">🚀</div>
              </div>
              <h3>Innovation</h3>
              <p>We embrace cutting-edge technologies and methodologies to stay ahead of the curve and deliver future-ready solutions.</p>
              <div className="value-highlight"></div>
            </motion.div>
            
            <motion.div 
              className="value-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="value-icon-wrapper">
                <div className="value-icon">🔒</div>
              </div>
              <h3>Integrity</h3>
              <p>We maintain the highest ethical standards in all our business practices, building trust through transparency.</p>
              <div className="value-highlight"></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Team Section */}
      <motion.section 
        className="team-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <span className="section-badge">Our Team</span>
            <h2 className="section-title">Meet the Innovators</h2>
            <p className="section-subtitle">
              Talented individuals passionate about creating exceptional digital experiences
            </p>
          </motion.div>
          
          {loading ? (
            <motion.div className="loading-container" variants={fadeInUp}>
              <div className="modern-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p>Loading our amazing team...</p>
            </motion.div>
          ) : (
            <motion.div className="team-grid" variants={staggerContainer}>
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={member.id} 
                  className="team-card"
                  variants={scaleIn}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="member-image-container">
                    <div className="member-image">
                      {member.image ? (
                        <img src={member.image} alt={member.name} />
                      ) : (
                        <div className="placeholder-avatar">
                          <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                      )}
                    </div>
                    <div className="member-overlay">
                      <div className="social-links">
                        {member.linkedin_url && (
                          <motion.a 
                            href={member.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <i className="fab fa-linkedin"></i>
                          </motion.a>
                        )}
                        {member.twitter_url && (
                          <motion.a 
                            href={member.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <i className="fab fa-twitter"></i>
                          </motion.a>
                        )}
                        {member.github_url && (
                          <motion.a 
                            href={member.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <i className="fab fa-github"></i>
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-position">{member.position}</p>
                    <p className="member-bio">{member.bio}</p>
                  </div>
                  
                  <div className="card-glow"></div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section 
        className="about-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="cta-content" variants={fadeInUp}>
            <div className="cta-background">
              <div className="cta-pattern"></div>
            </div>
            
            <div className="cta-text">
              <motion.h2 variants={fadeInUp}>
                Ready to Shape the Future?
              </motion.h2>
              <motion.p variants={fadeInUp}>
                Join our team of innovators and help us create extraordinary digital experiences 
                that make a difference in the world.
              </motion.p>
              
              <motion.div className="cta-buttons" variants={fadeInUp}>
                <motion.button 
                  className="btn btn-primary btn-large"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>View Careers</span>
                  <i className="fas fa-arrow-right"></i>
                </motion.button>
                
                <motion.button 
                  className="btn btn-outline btn-large"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Get in Touch</span>
                  <i className="fas fa-envelope"></i>
                </motion.button>
              </motion.div>
            </div>
            
            <motion.div className="cta-stats" variants={fadeInUp}>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Remote Friendly</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9/5</span>
                <span className="stat-label">Employee Rating</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Countries</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;