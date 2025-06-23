import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll as useFramerScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { apiService, Service as ServiceType } from '../services/api';
import { useInView } from 'react-intersection-observer';

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
      staggerChildren: 0.2
    }
  }
};

const ServiceCard: React.FC<Service> = ({ title, description, icon, price, tech_stack, image }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "-50px"
  });

  console.log('Rendering ServiceCard component:', title);
  return (
    <motion.div 
      ref={ref}
      className="service-card glass-card"
      variants={scaleIn}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.4)',
        y: -5
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="service-icon">
        {image ? (
          <img src={image} alt={title} className="service-icon-img" />
        ) : (
          <div className="service-icon-placeholder">{icon}</div>
        )}
      </div>
      <h3 className="gradient-text">{title}</h3>
      <p>{description}</p>
      <div className="price gradient-text">{price}</div>
      <div className="tech-stack">
        {tech_stack.map((tech, index) => (
          <motion.span 
            key={index} 
            className="tech-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
          >
            {tech}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  price: string;
  tech_stack: string[];
  image?: string;
}

const Services: React.FC = () => {
  console.log('Services component mounted');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    console.log('Services useEffect running');
    AOS.init({
      duration: 1000,
      once: true
    });

    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await apiService.getServices();
      console.log('Fetched services data:', data);
      // Map API service type to component service type
      const mappedServices = data.map(service => {
        console.log('Processing service:', service.title, 'Image path:', service.image);
        return {
          id: service.id,
          title: service.title,
          description: service.description,
          icon: '🚀', // Default icon since it's missing in API type
          price: service.price,
          tech_stack: service.tech_stack,
          image: service.image
        };
      });
      setServices(mappedServices);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
      setLoading(false);
      // Fallback data for development if apiService also fails
      setServices([
        {
          id: 1,
          title: 'Web Development',
          description: 'Modern, responsive websites built with cutting-edge technologies like React, Vue.js, and Node.js.',
          icon: '🚀',
          price: 'Starting from $2,000',
          tech_stack: ['React', 'Node.js', 'TypeScript', 'MongoDB']
        },
        {
          id: 2,
          title: 'Mobile App Development',
          description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Flutter.',
          icon: '📱',
          price: 'Starting from $3,000',
          tech_stack: ['React Native', 'Flutter', 'Swift', 'Kotlin']
        },
        {
          id: 3,
          title: 'AI & Machine Learning',
          description: 'Intelligent automation and machine learning implementations to optimize your business processes.',
          icon: '🤖',
          price: 'Starting from $5,000',
          tech_stack: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI']
        },
        {
          id: 4,
          title: 'Cloud Solutions',
          description: 'Scalable cloud infrastructure and deployment solutions using AWS, Azure, and Google Cloud.',
          icon: '☁️',
          price: 'Starting from $1,500',
          tech_stack: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
        },
        {
          id: 5,
          title: 'E-commerce Development',
          description: 'Complete e-commerce solutions with payment integration, inventory management, and analytics.',
          icon: '🛒',
          price: 'Starting from $4,000',
          tech_stack: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal']
        },
        {
          id: 6,
          title: 'UI/UX Design',
          description: 'Beautiful, user-centered designs that enhance user experience and drive conversions.',
          icon: '🎨',
          price: 'Starting from $1,000',
          tech_stack: ['Figma', 'Adobe XD', 'Sketch', 'Principle']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="services-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        </div>
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
        </div>
      </motion.div>

      <section className="services-grid-section">
        <div className="container">
          <motion.div 
            className="services-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {services.map((service, index) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;