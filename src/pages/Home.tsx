import React, { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TechSphere from '../components/TechSphere';

function AnimatedBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Environment preset="city" />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <TechSphere />
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}

const Home: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-3d-container">
          <AnimatedBackground />
        </div>
        <div className="hero-content" data-aos="fade-up">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">AZAYD</span>
          </h1>
          <p className="hero-subtitle">
            Transforming Ideas into Digital Reality
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-glow">Get Started</button>
            <button className="btn btn-secondary btn-outline">Learn More</button>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="services-preview" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card" data-aos="fade-up" data-aos-delay="100">
              <div className="service-icon">🚀</div>
              <h3>Web Development</h3>
              <p>Modern, responsive websites built with cutting-edge technologies.</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="200">
              <div className="service-icon">📱</div>
              <h3>Mobile Apps</h3>
              <p>Native and cross-platform mobile applications for iOS and Android.</p>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="300">
              <div className="service-icon">🤖</div>
              <h3>AI Solutions</h3>
              <p>Intelligent automation and machine learning implementations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="about-preview" data-aos="fade-up">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Why Choose AZAYD?</h2>
              <p>
                We combine innovation with expertise to deliver exceptional digital solutions. 
                Our team of skilled developers and designers work tirelessly to bring your 
                vision to life.
              </p>
              <ul className="feature-list">
                <li>✨ Cutting-edge technology</li>
                <li>🎯 Results-driven approach</li>
                <li>🤝 Collaborative process</li>
                <li>⚡ Fast delivery</li>
              </ul>
            </div>
            <div className="about-visual">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Projects Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Happy Clients</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-aos="fade-up">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Project?</h2>
            <p>Let's work together to bring your ideas to life.</p>
            <button className="btn btn-primary btn-large">Get In Touch</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;