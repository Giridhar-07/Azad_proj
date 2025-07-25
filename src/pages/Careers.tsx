import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { apiService } from '../services/api';
import '../styles/careers.css';
import '../styles/resumeForm.css';
import TechSphere from '../components/TechSphere';
import ResumeForm from '../components/ResumeForm';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const slideInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.03,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
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

const jobCardAnimation = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  posted_date: string;
  salary_range?: string;
  experience_level?: string;
  tags?: string[];
}

interface CompanyStats {
  employees: number;
  openPositions: number;
  satisfaction: number;
  responseTime: string;
}

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [activeSection, setActiveSection] = useState('');
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [resumeSubmitted, setResumeSubmitted] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Computed values using useMemo
  const companyStats: CompanyStats = useMemo(() => ({
    employees: 50,
    openPositions: jobs.length,
    satisfaction: 95,
    responseTime: '24h'
  }), [jobs.length]);

  const departments = useMemo(() => 
    ['all', ...Array.from(new Set(jobs.map(job => job.department)))],
    [jobs]
  );

  const locations = useMemo(() => 
    ['all', ...Array.from(new Set(jobs.map(job => job.location)))],
    [jobs]
  );

  const jobTypes = useMemo(() => 
    ['all', ...Array.from(new Set(jobs.map(job => job.type)))],
    [jobs]
  );

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
      const matchesLocation = filterLocation === 'all' || job.location.includes(filterLocation);
      const matchesType = filterType === 'all' || job.type === filterType;
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesDepartment && matchesLocation && matchesType && matchesSearch;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'date':
        default:
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
      }
    });

    return filtered;
  }, [jobs, filterDepartment, filterLocation, filterType, searchQuery, sortBy]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    fetchJobs();
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiService.getJobPostings();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load job postings. Please try again.');
      // Fallback data for development if apiService also fails
      setJobs([
        {
          id: 1,
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'Remote / New York',
          type: 'Full-time',
          description: 'We are looking for a senior full stack developer to join our growing engineering team. You will be responsible for developing and maintaining our web applications using modern technologies.',
          requirements: [
            '5+ years of experience in full stack development',
            'Proficiency in React, Node.js, and TypeScript',
            'Experience with cloud platforms (AWS, Azure, or GCP)',
            'Strong understanding of database design and optimization',
            'Excellent problem-solving and communication skills'
          ],
          posted_date: '2024-01-15',
          salary_range: '$120,000 - $160,000'
        },
        {
          id: 2,
          title: 'UI/UX Designer',
          department: 'Design',
          location: 'San Francisco / Remote',
          type: 'Full-time',
          description: 'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and developers to bring designs to life.',
          requirements: [
            '3+ years of experience in UI/UX design',
            'Proficiency in Figma, Sketch, or Adobe XD',
            'Strong portfolio demonstrating design thinking',
            'Experience with user research and testing',
            'Knowledge of design systems and accessibility'
          ],
          posted_date: '2024-01-10',
          salary_range: '$90,000 - $130,000'
        },
        {
          id: 3,
          title: 'DevOps Engineer',
          department: 'Engineering',
          location: 'Austin / Remote',
          type: 'Full-time',
          description: 'Help us scale our infrastructure and improve our deployment processes. You will work on automation, monitoring, and ensuring high availability of our systems.',
          requirements: [
            '4+ years of experience in DevOps or Site Reliability Engineering',
            'Experience with Docker, Kubernetes, and CI/CD pipelines',
            'Knowledge of infrastructure as code (Terraform, CloudFormation)',
            'Experience with monitoring and logging tools',
            'Strong scripting skills (Python, Bash, or similar)'
          ],
          posted_date: '2024-01-08',
          salary_range: '$110,000 - $150,000'
        },
        {
          id: 4,
          title: 'Product Manager',
          department: 'Product',
          location: 'Boston / Remote',
          type: 'Full-time',
          description: 'Lead product strategy and execution for our core platform. You will work with cross-functional teams to define and deliver features that delight our users.',
          requirements: [
            '3+ years of experience in product management',
            'Strong analytical and data-driven decision making skills',
            'Experience with agile development methodologies',
            'Excellent communication and leadership skills',
            'Technical background or strong technical aptitude'
          ],
          posted_date: '2024-01-05',
          salary_range: '$100,000 - $140,000'
        },
        {
          id: 5,
          title: 'Marketing Specialist',
          department: 'Marketing',
          location: 'Los Angeles / Remote',
          type: 'Full-time',
          description: 'Drive our marketing initiatives and help grow our brand presence. You will be responsible for content creation, social media management, and campaign execution.',
          requirements: [
            '2+ years of experience in digital marketing',
            'Experience with content creation and social media management',
            'Knowledge of SEO, SEM, and marketing analytics',
            'Strong writing and communication skills',
            'Creative mindset with attention to detail'
          ],
          posted_date: '2024-01-03',
          salary_range: '$60,000 - $80,000',
          experience_level: 'Mid-level',
          tags: ['Marketing', 'Content', 'Social Media']
        },
        {
          id: 6,
          title: 'Data Scientist',
          department: 'Engineering',
          location: 'Seattle / Remote',
          type: 'Full-time',
          description: 'Join our data team to extract insights from complex datasets and build machine learning models that drive business decisions.',
          requirements: [
            '3+ years of experience in data science or analytics',
            'Proficiency in Python, R, and SQL',
            'Experience with machine learning frameworks (TensorFlow, PyTorch)',
            'Strong statistical analysis and data visualization skills',
            'Experience with cloud platforms and big data tools'
          ],
          posted_date: '2024-01-01',
          salary_range: '$130,000 - $170,000',
          experience_level: 'Senior',
          tags: ['Data Science', 'Machine Learning', 'Python']
        }
      ]);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  // Callback functions
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterDepartment('all');
    setFilterLocation('all');
    setFilterType('all');
    setSortBy('date');
  }, []);

  const handleApply = useCallback((job: JobPosting) => {
    // Navigate to the job detail page using React Router
    window.location.href = `/careers/${job.id}`;
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleResumeSuccess = () => {
    setResumeSubmitted(true);
    setTimeout(() => {
      setShowResumeForm(false);
    }, 2000);
  };

  return (
    <div className="careers-page">
      <AnimatePresence>
        {showResumeForm && (
          <ResumeForm 
            onClose={() => setShowResumeForm(false)} 
            onSuccess={handleResumeSuccess} 
          />
        )}
      </AnimatePresence>
      {/* Enhanced Hero Section with 3D Sphere */}
      <motion.section 
        ref={heroRef}
        className="careers-hero"
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
              <Environment files="/hdri/potsdamer_platz_1k.hdr" />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
          </Canvas>
        </div>
        
        <motion.div className="hero-content" style={{ y, opacity }}>
          <div className="container">
            <motion.div className="hero-text" variants={staggerContainer}>
              <motion.div className="hero-badge" variants={fadeInUp}>
                <span>🚀 We're Hiring</span>
              </motion.div>
              
              <motion.h1 className="hero-title" variants={fadeInUp}>
                Join Our <span className="gradient-text">Innovation</span> Journey
              </motion.h1>
              
              <motion.p className="hero-description" variants={fadeInUp}>
                Build your career with us and help shape the future of technology. 
                Join a team of passionate innovators creating solutions that matter.
              </motion.p>
              
              <motion.div className="hero-stats" variants={staggerContainer}>
                <motion.div 
                  className="stat-item"
                  variants={scaleIn}
                  whileHover={cardHoverVariants.hover}
                >
                  <motion.span 
                    className="stat-number"
                    variants={pulseVariants}
                    animate="animate"
                  >
                    {companyStats.employees}+
                  </motion.span>
                  <span className="stat-label">Team Members</span>
                </motion.div>
                <motion.div 
                  className="stat-item"
                  variants={scaleIn}
                  whileHover={cardHoverVariants.hover}
                >
                  <motion.span 
                    className="stat-number"
                    variants={pulseVariants}
                    animate="animate"
                  >
                    {companyStats.openPositions}+
                  </motion.span>
                  <span className="stat-label">Open Positions</span>
                </motion.div>
                <motion.div 
                  className="stat-item"
                  variants={scaleIn}
                  whileHover={cardHoverVariants.hover}
                >
                  <motion.span 
                    className="stat-number"
                    variants={pulseVariants}
                    animate="animate"
                  >
                    {companyStats.satisfaction}%
                  </motion.span>
                  <span className="stat-label">Employee Satisfaction</span>
                </motion.div>
              </motion.div>
              
              <motion.div className="hero-actions" variants={fadeInUp}>
                <motion.button 
                  className="btn btn-primary btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.querySelector('.jobs-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Open Positions
                </motion.button>
                <motion.button 
                  className="btn btn-outline btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn About Culture
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Enhanced Benefits Section */}
      <motion.section 
        className="benefits-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <motion.div className="section-badge" variants={scaleIn}>
              <span>✨ Benefits & Perks</span>
            </motion.div>
            <motion.h2 className="section-title" variants={fadeInUp}>
              Why Choose <span className="gradient-text">AZAYD</span>?
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeInUp}>
              We believe in creating an environment where our team can thrive both professionally and personally.
            </motion.p>
          </motion.div>
          
          <motion.div className="benefits-grid" variants={staggerContainer}>
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">💰</div>
              <h3>Competitive Salary</h3>
              <p>We offer competitive compensation packages with equity options and performance bonuses.</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">🏠</div>
              <h3>Remote Friendly</h3>
              <p>Work from anywhere with flexible hours and remote-first culture that promotes work-life balance.</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">📚</div>
              <h3>Learning & Growth</h3>
              <p>Continuous learning opportunities with $2000 annual professional development budget.</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">🏥</div>
              <h3>Health Benefits</h3>
              <p>Comprehensive health, dental, and vision insurance with 100% premium coverage.</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">🌴</div>
              <h3>Unlimited PTO</h3>
              <p>Take the time you need to recharge with our unlimited vacation policy and mental health days.</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <div className="benefit-icon">🎯</div>
              <h3>Meaningful Impact</h3>
              <p>Work on meaningful projects that make a real difference for our clients and society.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Jobs Section */}
      <motion.section 
        className="jobs-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <motion.div className="section-badge" variants={scaleIn}>
              <span>💼 Open Positions</span>
            </motion.div>
            <motion.h2 className="section-title" variants={fadeInUp}>
              Find Your <span className="gradient-text">Dream Role</span>
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeInUp}>
              Explore exciting opportunities to grow your career with our innovative team.
            </motion.p>
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="error-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                variants={slideInDown}
              >
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span className="error-message">{error}</span>
                  <motion.button 
                    className="retry-btn"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRetrying ? 'Retrying...' : 'Retry'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="jobs-controls" variants={fadeInUp}>
            {/* Search Bar */}
            <div className="search-container">
              <motion.div 
                className="search-input-wrapper"
                whileFocus={{ scale: 1.02 }}
              >
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or requirements..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <motion.button
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Filters */}
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="department-filter">Department:</label>
                <motion.select 
                  id="department-filter"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="filter-select"
                  whileFocus={{ scale: 1.02 }}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </motion.select>
              </div>

              <div className="filter-group">
                <label htmlFor="location-filter">Location:</label>
                <motion.select 
                  id="location-filter"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="filter-select"
                  whileFocus={{ scale: 1.02 }}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc === 'all' ? 'All Locations' : loc}
                    </option>
                  ))}
                </motion.select>
              </div>

              <div className="filter-group">
                <label htmlFor="type-filter">Type:</label>
                <motion.select 
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                  whileFocus={{ scale: 1.02 }}
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </motion.select>
              </div>

              <div className="filter-group">
                <label htmlFor="sort-select">Sort by:</label>
                <motion.select 
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="date">Latest</option>
                  <option value="title">Title</option>
                  <option value="department">Department</option>
                  <option value="location">Location</option>
                </motion.select>
              </div>

              <motion.button
                className="clear-filters-btn"
                onClick={handleClearFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            </div>

            {/* Results Summary */}
            <motion.div className="results-summary" variants={fadeInUp}>
              <span className="results-count">
                {filteredAndSortedJobs.length} position{filteredAndSortedJobs.length !== 1 ? 's' : ''} found
                {(searchQuery || filterDepartment !== 'all' || filterLocation !== 'all' || filterType !== 'all') && 
                  ` matching your criteria`
                }
              </span>
            </motion.div>
          </motion.div>

          {loading ? (
            <motion.div className="loading-container" variants={staggerContainer}>
              <motion.div className="loading-header" variants={fadeInUp}>
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p>Loading amazing opportunities...</p>
              </motion.div>
              
              {/* Skeleton Loaders */}
              <div className="skeleton-jobs">
                {[...Array(3)].map((_, index) => (
                  <motion.div 
                    key={index}
                    className="skeleton-job-card"
                    variants={fadeInUp}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="skeleton-header">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-meta">
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                      </div>
                    </div>
                    <div className="skeleton-actions">
                      <div className="skeleton-btn"></div>
                      <div className="skeleton-btn"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div className="jobs-list" variants={staggerContainer}>
              {filteredAndSortedJobs.length === 0 ? (
                <motion.div className="no-jobs" variants={fadeInUp}>
                  <div className="no-jobs-content">
                    <motion.div 
                      className="no-jobs-icon"
                      variants={floatingVariants}
                      animate="animate"
                    >
                      🔍
                    </motion.div>
                    <h3>No positions found</h3>
                    <p>
                      {searchQuery || filterDepartment !== 'all' || filterLocation !== 'all' || filterType !== 'all'
                        ? 'No job openings match your current search criteria.'
                        : 'No job openings are currently available.'}
                    </p>
                    {(searchQuery || filterDepartment !== 'all' || filterLocation !== 'all' || filterType !== 'all') && (
                      <motion.button
                        className="btn btn-outline"
                        onClick={handleClearFilters}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear All Filters
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredAndSortedJobs.map((job, index) => (
                    <motion.div 
                      key={job.id} 
                      className="job-card"
                      variants={jobCardAnimation}
                      whileHover="hover"
                      layout
                    >
                      <div className="job-header">
                        <div className="job-title-section">
                          <motion.h3 
                            className="job-title"
                            whileHover={{ color: '#007bff' }}
                          >
                            {job.title}
                          </motion.h3>
                          <div className="job-meta">
                            <motion.span 
                              className="job-department"
                              whileHover={cardHoverVariants.hover}
                            >
                              🏢 {job.department}
                            </motion.span>
                            <motion.span 
                              className="job-location"
                              whileHover={cardHoverVariants.hover}
                            >
                              📍 {job.location}
                            </motion.span>
                            <motion.span 
                              className="job-type"
                              whileHover={cardHoverVariants.hover}
                            >
                              ⏰ {job.type}
                            </motion.span>
                            {job.experience_level && (
                              <motion.span 
                                className="job-experience"
                                whileHover={cardHoverVariants.hover}
                              >
                                🎯 {job.experience_level}
                              </motion.span>
                            )}
                          </div>
                          {job.tags && job.tags.length > 0 && (
                            <div className="job-tags">
                              {job.tags.map((tag, tagIndex) => (
                                <motion.span 
                                  key={tagIndex}
                                  className="job-tag"
                                  whileHover={{ scale: 1.1 }}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: tagIndex * 0.1 }}
                                >
                                  {tag}
                                </motion.span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="job-actions">
                          <motion.button 
                            className="btn btn-secondary"
                            onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {selectedJob?.id === job.id ? '👁️ Hide Details' : '👁️ View Details'}
                          </motion.button>
                          <motion.button 
                            className="btn btn-primary"
                            onClick={() => handleApply(job)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🚀 Apply Now
                          </motion.button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {selectedJob?.id === job.id && (
                          <motion.div 
                            className="job-details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="job-description">
                              <h4>Description</h4>
                              <p>{job.description}</p>
                            </div>
                            
                            <div className="job-requirements">
                              <h4>Requirements</h4>
                              <ul>
                                {job.requirements.map((req, reqIndex) => (
                                  <motion.li 
                                    key={reqIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: reqIndex * 0.1 }}
                                  >
                                    {req}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                            
                            {job.salary_range && (
                              <div className="job-salary">
                                <h4>Salary Range</h4>
                                <p>{job.salary_range}</p>
                              </div>
                            )}
                            
                            <div className="job-posted">
                              <p><strong>Posted:</strong> {new Date(job.posted_date).toLocaleDateString()}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section 
        className="careers-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.div className="cta-content" variants={fadeInUp}>
            <motion.div className="cta-badge" variants={scaleIn}>
              <span>🌟 Join Our Mission</span>
            </motion.div>
            
            <motion.h2 className="cta-title" variants={fadeInUp}>
              Don't See a <span className="gradient-text">Perfect Match</span>?
            </motion.h2>
            
            <motion.p className="cta-description" variants={fadeInUp}>
              We're always interested in hearing from talented individuals who share our passion for innovation. 
              Send us your resume and let's explore how you can contribute to our mission!
            </motion.p>
            
            <motion.div className="cta-actions" variants={staggerContainer}>
              <motion.button 
                className="btn btn-primary btn-large"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResumeForm(true)}
              >
                Send Resume
              </motion.button>
              
              <motion.button 
                className="btn btn-outline btn-large"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/contact'}
              >
                Schedule a Call
              </motion.button>
            </motion.div>
            
            <motion.div className="cta-stats" variants={staggerContainer}>
              <motion.div className="cta-stat" variants={scaleIn}>
                <span className="stat-number">24h</span>
                <span className="stat-label">Average Response Time</span>
              </motion.div>
              <motion.div className="cta-stat" variants={scaleIn}>
                <span className="stat-number">85%</span>
                <span className="stat-label">Interview Success Rate</span>
              </motion.div>
              <motion.div className="cta-stat" variants={scaleIn}>
                <span className="stat-number">100+</span>
                <span className="stat-label">Applications This Month</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Careers;