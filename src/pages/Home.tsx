import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll as useFramerScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useInView } from 'react-intersection-observer';
import TechSphere from '../components/TechSphere';

// Simple CountUp component for statistics
const CountUp = ({ start = 0, end = 100, duration = 2.5, suffix = '' }) => {
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
        const currentCount = Math.floor(progress * (end - start) + start);
        
        countRef.current = currentCount;
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [inView, start, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
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

const Home: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
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
            Welcome to <span className="gradient-text animated-gradient">AZAYD</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            variants={fadeIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transforming Ideas into <span className="typing-text">Digital Reality</span>
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
            >
              <span className="btn-text">Get Started</span>
              <span className="btn-icon">→</span>
            </motion.button>
            <motion.button 
              className="btn btn-secondary btn-outline"
              whileHover={{ scale: 1.05, borderColor: 'rgba(79, 70, 229, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-text">Learn More</span>
              <span className="btn-icon">↓</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Services Preview */}
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
          <div className="services-grid">
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
                <button className="btn btn-sm btn-primary">Learn More</button>
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
                <button className="btn btn-sm btn-primary">Learn More</button>
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
                <button className="btn btn-sm btn-primary">Learn More</button>
              </motion.div>
            </motion.div>
          </div>
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
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={100} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Projects Completed</div>
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
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={50} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Happy Clients</div>
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
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CountUp start={0} end={5} duration={2.5} suffix="+" />
                  </motion.div>
                  <div className="stat-label">Years Experience</div>
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
                  <motion.div 
                    className="stat-number"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    24/7
                  </motion.div>
                  <div className="stat-label">Support</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
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
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.button 
                className="btn btn-light btn-large btn-glow"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 0 25px rgba(255, 255, 255, 0.5)' 
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-text">Get In Touch</span>
                <motion.span 
                  className="btn-icon"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;