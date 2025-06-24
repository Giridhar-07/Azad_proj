import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, useScroll as useFramerScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { apiService, Service as ServiceType } from '../services/api';
import { useInView } from 'react-intersection-observer';
import '../styles/Services.css';

// Lazy load components for better performance
const ServiceDetailModal = lazy(() => import('../components/ServiceDetailModal'));
const ServiceFilters = lazy(() => import('../components/ServiceFilters'));

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.6, -0.05, 0.01, 0.99],
      type: "spring",
      stiffness: 100
    }
  }
};

const slideIn = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.6, -0.05, 0.01, 0.99],
      type: "spring",
      stiffness: 100
    }
  }
};

const slideInRight = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.6, -0.05, 0.01, 0.99],
      type: "spring",
      stiffness: 100
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.6, -0.05, 0.01, 0.99],
      type: "spring",
      stiffness: 100
    }
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

const filterButtonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95
  }
};

const searchBarVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: {
    opacity: 1,
    width: 'auto',
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

interface ServiceCardProps extends Service {
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

// Enhanced ServiceCard component with better interactions
const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, price, tech_stack, image, viewMode = 'grid', onClick }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "-50px"
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const cardClasses = viewMode === 'grid' 
    ? "service-card glass-card"
    : "service-card-list glass-card flex items-center p-6 space-x-6";

  return (
    <motion.div 
      ref={ref}
      className={cardClasses}
      variants={scaleIn}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ 
        scale: viewMode === 'grid' ? 1.05 : 1.02,
        boxShadow: '0 25px 50px 0 rgba(31, 38, 135, 0.5)',
        y: -8,
        rotateY: viewMode === 'grid' ? 5 : 0,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        cursor: 'pointer'
      }}
    >
      {viewMode === 'grid' ? (
        // Grid View Layout
        <>
          <motion.div 
            className="service-icon"
            whileHover={{ 
              rotateY: 10,
              scale: 1.1,
              transition: { duration: 0.3 }
            }}
          >
            {image && !imageError ? (
              <div className="service-icon-container">
                {!imageLoaded && (
                  <div className="image-loading-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img 
                  src={image} 
                  alt={title} 
                  className={`service-icon-img ${imageLoaded ? 'loaded' : 'loading'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
              </div>
            ) : (
              <motion.div 
                className="service-icon-placeholder"
                whileHover={{ 
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                {icon}
              </motion.div>
            )}
          </motion.div>
          
          <motion.h3 
            className="gradient-text service-title"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="service-description"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            {description}
          </motion.p>
          
          <motion.div 
            className="price gradient-text"
            whileHover={{ 
              scale: 1.1,
              textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              transition: { duration: 0.2 }
            }}
          >
            {price}
          </motion.div>
          
          <div className="tech-stack">
            {tech_stack.map((tech, index) => (
              <motion.span 
                key={index} 
                className="tech-badge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ 
                  scale: 1.15, 
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
                  y: -2,
                  transition: { duration: 0.2 }
                }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </>
      ) : (
        // List View Layout
        <>
          <div className="flex-shrink-0">
            {image && !imageError ? (
              <div className="service-icon-container">
                {!imageLoaded && (
                  <div className="image-loading-skeleton w-20 h-20">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img 
                  src={image} 
                  alt={title} 
                  className={`w-20 h-20 object-cover rounded-lg ${imageLoaded ? 'loaded' : 'loading'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
              </div>
            ) : (
              <motion.div 
                className="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-3xl"
                whileHover={{ 
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                {icon}
              </motion.div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <motion.h3 
              className="gradient-text service-title text-xl font-bold mb-2"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              {title}
            </motion.h3>
            
            <motion.p 
              className="service-description text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              {description}
            </motion.p>
            
            <div className="tech-stack flex flex-wrap gap-2">
              {tech_stack.slice(0, 4).map((tech, index) => (
                <motion.span 
                  key={index} 
                  className="tech-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ 
                    scale: 1.15, 
                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  {tech}
                </motion.span>
              ))}
              {tech_stack.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-sm">
                  +{tech_stack.length - 4}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 text-right">
            <motion.div 
              className="price gradient-text text-lg font-semibold mb-2"
              whileHover={{ 
                scale: 1.1,
                textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                transition: { duration: 0.2 }
              }}
            >
              {price}
            </motion.div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              View Details
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

interface Service {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  icon: string;
  price: string;
  tech_stack: string[];
  image?: string;
  created_at: string;
  updated_at?: string;
  slug?: string;
  is_featured?: boolean;
  duration?: string;
}

/**
 * Enhanced Services Component
 * 
 * Features:
 * - Modern routing with URL state management
 * - Advanced filtering and search capabilities
 * - Optimized performance with lazy loading
 * - Comprehensive error handling and retry mechanisms
 * - Responsive design with smooth animations
 * - SEO-friendly with proper meta tags
 * 
 * @returns {JSX.Element} Services page component
 */
const Services: React.FC = () => {
  // Router hooks for URL state management
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core state management
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Filter and search state - synchronized with URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'recent' | 'price_low' | 'price_high'>((searchParams.get('sort') as 'name' | 'price' | 'recent' | 'price_low' | 'price_high') || 'name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Performance optimization states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  // Scroll animation references - moved before conditional returns to follow Rules of Hooks
  const { scrollYProgress } = useFramerScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.97]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -20]);
  
  // Hero section in-view animation - moved before conditional returns to follow Rules of Hooks
  const [heroRef, heroInView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });

  // URL synchronization effect
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'name') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  // Enhanced filtering and sorting with performance optimization
  const filteredServices = useMemo(() => {
    try {
      let filtered = services.filter(service => {
        // Search functionality - enhanced with fuzzy matching
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch = !searchLower || 
          service.title.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.tech_stack.some(tech => tech.toLowerCase().includes(searchLower)) ||
          (service.short_description && service.short_description.toLowerCase().includes(searchLower));
        
        // Category filtering
        const matchesCategory = selectedCategory === 'all' || 
          service.tech_stack.some(tech => 
            tech.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        
        // Price range filtering
        const servicePrice = parseFloat(service.price.replace(/[^\d.]/g, '')) || 0;
        const matchesPrice = servicePrice >= priceRange[0] && servicePrice <= priceRange[1];
        
        return matchesSearch && matchesCategory && matchesPrice;
      });

      // Enhanced sorting with multiple criteria
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'price':
            const priceA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
            const priceB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
            return priceA - priceB;
          case 'recent':
            // Use created_at if available, fallback to ID
            if (a.created_at && b.created_at) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.id - a.id;
          default:
            return 0;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering services:', error);
      return services; // Return unfiltered services on error
    }
  }, [services, searchTerm, selectedCategory, sortBy, priceRange]);

  // Pagination logic
  const paginatedServices = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(0, endIndex);
  }, [filteredServices, page, itemsPerPage]);

  // Get unique categories from services
  const categories = useMemo(() => {
    const allTechs = services.flatMap(service => service.tech_stack);
    const uniqueTechs = Array.from(new Set(allTechs.map(tech => tech.toLowerCase())));
    return ['all', ...uniqueTechs.slice(0, 6)]; // Limit to 6 categories plus 'all'
  }, [services]);

  /**
   * Enhanced service fetching with caching, retry logic, and pagination
   */
  const fetchServices = useCallback(async (retryCount = 0, forceRefresh = false) => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    const cacheKey = `azayd_services_cache_${page}_${searchTerm}_${selectedCategory}_${sortBy}`;
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    try {
      setLoading(true);
      setError(null);
      
      // Check for cached data first (unless force refresh)
      if (!forceRefresh) {
        const cachedServices = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        if (cachedServices && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            const parsedData = JSON.parse(cachedServices);
            setServices(parsedData.results || parsedData);
            setHasMore(!!parsedData.next);
            setLoading(false);
            return;
          }
        }
      }
      
      // Prepare API parameters
      const params = {
        page,
        page_size: itemsPerPage,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        ordering: sortBy === 'recent' ? '-created_at' : 
                 sortBy === 'price_low' ? 'price' :
                 sortBy === 'price_high' ? '-price' :
                 sortBy === 'name' ? 'title' : '-created_at',
        price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
        price_max: priceRange[1] < 10000 ? priceRange[1] : undefined
      };
      
      await fetchFreshData(params);
      
    } catch (err) {
      console.error(`Error fetching services (attempt ${retryCount + 1}):`, err);
      
      if (retryCount < maxRetries) {
        setError(`Connection failed. Retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(() => {
          fetchServices(retryCount + 1, forceRefresh);
        }, retryDelay);
        return;
      }
      
      // Final fallback after all retries
      setError('Unable to load services. Please check your connection and try again.');
      loadFallbackData();
    } finally {
      if (retryCount === 0) {
        setLoading(false);
        setIsRetrying(false);
      }
    }
    
    /**
     * Fetch fresh data from API with parameters
     */
    async function fetchFreshData(apiParams: any) {
      const response = await apiService.getServices(apiParams);
      const data = response.results || response;
      console.log('✅ Fetched fresh services data:', data.length, 'services');
      
      // Enhanced mapping with better error handling
      const mappedServices = data.map(service => {
        try {
          return {
            id: service.id,
            title: service.title || 'Untitled Service',
            description: service.description || 'No description available',
            icon: service.icon || getDefaultIcon(service.tech_stack),
            price: service.price || 'Contact for pricing',
            tech_stack: Array.isArray(service.tech_stack) ? service.tech_stack : [],
            image: service.image,
            short_description: service.short_description,
            created_at: service.created_at,
            updated_at: service.updated_at,
            slug: service.slug,
            is_featured: service.is_featured,
            duration: service.duration
          };
        } catch (mappingError) {
          console.warn('Error mapping service:', service.id, mappingError);
          return null;
        }
      }).filter(Boolean) as Service[]; // Remove null entries and assert type
      
      setServices(mappedServices);
      setHasMore(!!response.next);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(response));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    }
    
    /**
     * Load fallback data when API is unavailable
     */
    function loadFallbackData() {
      const fallbackServices: Service[] = [
        {
          id: 1,
          title: 'Web Development',
          description: 'Modern, responsive websites built with cutting-edge technologies like React, Vue.js, and Node.js.',
          short_description: 'Modern, responsive websites',
          icon: '🚀',
          price: 'Starting from $2,000',
          tech_stack: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
          created_at: new Date().toISOString(),
          is_featured: true
        },
        {
          id: 2,
          title: 'Mobile App Development',
          description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Flutter.',
          short_description: 'Native and cross-platform mobile apps',
          icon: '📱',
          price: 'Starting from $3,000',
          tech_stack: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
          created_at: new Date().toISOString(),
          is_featured: true
        },
        {
          id: 3,
          title: 'AI & Machine Learning',
          description: 'Intelligent automation and machine learning implementations to optimize your business processes.',
          short_description: 'AI and ML solutions',
          icon: '🤖',
          price: 'Starting from $5,000',
          tech_stack: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI'],
          created_at: new Date().toISOString(),
          is_featured: false
        }
      ];
      setServices(fallbackServices);
    }
    
    /**
     * Get default icon based on tech stack
     */
    function getDefaultIcon(techStack: string[]): string {
      if (!Array.isArray(techStack)) return '🚀';
      
      const iconMap: Record<string, string> = {
        'react': '⚛️',
        'vue': '💚',
        'angular': '🅰️',
        'node': '🟢',
        'python': '🐍',
        'java': '☕',
        'mobile': '📱',
        'ai': '🤖',
        'cloud': '☁️',
        'design': '🎨',
        'ecommerce': '🛒'
      };
      
      for (const tech of techStack) {
        const lowerTech = tech.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
          if (lowerTech.includes(key)) {
            return icon;
          }
        }
      }
      
      return '🚀'; // Default fallback
    }
  }, []);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    fetchServices();
  }, [fetchServices]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((sort: 'name' | 'price' | 'recent') => {
    setSortBy(sort);
  }, []);

  // Initialize AOS on component mount
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);
  
  // Fetch services when dependencies change
  useEffect(() => {
    fetchServices();
  }, [page, searchTerm, selectedCategory, sortBy, priceRange]);
  
  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="services-page">
        <motion.div 
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="spinner"></div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isRetrying ? 'Retrying...' : 'Loading our amazing services...'}
          </motion.p>
          
          {/* Skeleton Cards */}
          <div className="services-grid skeleton-grid">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                className="skeleton-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="skeleton-icon"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-description"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-tags">
                  <div className="skeleton-tag"></div>
                  <div className="skeleton-tag"></div>
                  <div className="skeleton-tag"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  
  console.log('Services state:', { services, loading, error });
  
  return (
    <div className="services-page">
      <motion.div 
        className="hero-section"
        ref={heroRef}
        style={{ opacity, scale, y }}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="container">
          <motion.h1 
            className="hero-title gradient-text"
            variants={slideIn}
          >
            Our Services
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            variants={fadeInUp}
          >
            Comprehensive digital solutions tailored to your business needs
          </motion.p>
          
          {/* Enhanced Search and Filter Controls */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-32 mb-8"></div>
          }>
            <ServiceFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsCount={paginatedServices.length}
            />
          </Suspense>
          
          {/* Error Banner */}
          {error && (
            <motion.div 
              className="error-banner bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-red-700 dark:text-red-300">{error}</span>
                <motion.button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
        </div>
      </motion.div>

      <section className="services-grid-section py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {paginatedServices.length > 0 ? (
              <>
                {/* Services Grid/List */}
                <motion.div 
                  className={`services-container ${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                      : 'space-y-6'
                  }`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  key={`services-${viewMode}`}
                >
                  {paginatedServices.map((service, index) => (
                    <ServiceCard 
                      key={service.id} 
                      {...service} 
                      viewMode={viewMode}
                      onClick={() => setSelectedService(service)}
                    />
                  ))}
                </motion.div>

                {/* Pagination */}
                {filteredServices.length > itemsPerPage && (
                  <motion.div 
                    className="pagination-container mt-12 flex justify-center items-center space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.ceil(filteredServices.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(pageNum => {
                          const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
                          return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 2;
                        })
                        .map((pageNum, index, array) => {
                          const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                          return (
                            <React.Fragment key={pageNum}>
                              {showEllipsis && (
                                <span className="px-3 py-2 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => setPage(pageNum)}
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  page === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                {pageNum}
                              </button>
                            </React.Fragment>
                          );
                        })
                      }
                    </div>
                    
                    <button
                      onClick={() => setPage(Math.min(Math.ceil(filteredServices.length / itemsPerPage), page + 1))}
                      disabled={page >= Math.ceil(filteredServices.length / itemsPerPage)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                className="no-results text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="no-results"
              >
                <div className="max-w-md mx-auto">
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    🔍
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No services found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm 
                      ? `No services match "${searchTerm}"${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}`
                      : `No services available in ${selectedCategory}`
                    }
                  </p>
                  <motion.button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setPriceRange([0, 10000]);
                      navigate('/services', { replace: true });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All Filters
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Service Detail Modal */}
      <Suspense fallback={null}>
        <ServiceDetailModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      </Suspense>
    </div>
  );
};

export default Services;