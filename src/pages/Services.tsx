import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });

    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services/');
      setServices(response.data);
    } catch (err) {
      setError('Failed to load services');
      // Fallback data for development
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

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero" data-aos="fade-up">
        <div className="container">
          <h1 className="page-title">Our Services</h1>
          <p className="page-subtitle">
            Comprehensive digital solutions tailored to your business needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          {error && (
            <div className="error-message" data-aos="fade-up">
              <p>{error}</p>
              <p>Showing sample data for demonstration.</p>
            </div>
          )}
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className="service-card enhanced"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  <h3 className="service-title">{service.title}</h3>
                </div>
                
                <div className="service-content">
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">{service.price}</span>
                  </div>
                  
                  <div className="tech-stack">
                    <h4>Technologies:</h4>
                    <div className="tech-tags">
                      {service.tech_stack.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="service-actions">
                  <button className="btn btn-primary">Learn More</button>
                  <button className="btn btn-secondary">Get Quote</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta" data-aos="fade-up">
        <div className="container">
          <div className="cta-content">
            <h2>Need a Custom Solution?</h2>
            <p>We can create tailored solutions that perfectly fit your unique requirements.</p>
            <button className="btn btn-primary btn-large">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;