import './styles/main.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Security } from './utils/security';
import { Export } from './pages/services';

gsap.registerPlugin(ScrollTrigger);

console.log(Export);

class AzaydWebsite {
  constructor() {
    this.initializeDOM();
    this.initializeComponents();
    this.initializeAnimations();
    this.setupEventListeners();
    this.initializeSecurity();
  }

  private initializeComponents(): void {
    // Initialize logo after ensuring container exists
    try {
      const logoContainer = document.getElementById('logo-container');
      if (logoContainer) {
        // Set initial dimensions to prevent clientWidth/clientHeight being 0
        logoContainer.style.width = '200px';
        logoContainer.style.height = '60px';
        
        // Initialize logo with a slight delay to ensure container is ready
        setTimeout(() => {
          // Initialize logo with a slight delay to ensure container is ready
        }, 0);
      }
    } catch (error) {
      console.error('Failed to initialize logo:', error);
    }
  }

  private initializeDOM(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="page">
        <header class="header">
          <div class="header__container">
            <a href="/" class="header__logo">
              <div id="logo-container" class="logo-container"></div>
              <span class="logo__text">Azayd IT</span>
            </a>
            <nav class="nav">
              <ul class="nav__list">
                <li><a href="/" class="nav__link">Home</a></li>
                <li><a href="/services" class="nav__link">Services</a></li>
                <li><a href="/about" class="nav__link">About</a></li>
                <li><a href="/careers" class="nav__link">Careers</a></li>
                <li><a href="/contact" class="nav__link">Contact</a></li>
              </ul>
              <button class="nav__toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </nav>
          </div>
        </header>

        <main class="main">
          <section class="hero" id="home">
            <div class="hero__content">
              <h1 class="hero__title">Azayd IT Consulting Services</h1>
              <p class="hero__subtitle">
                Empowering businesses through innovative IT solutions and expert consulting services in Bengaluru
              </p>
              <a href="/contact" class="button button--primary" data-aos="fade-up">Get Started</a>
            </div>
            <div class="hero__background"></div>
          </section>

          <section class="services" id="services">
            <div class="section__container">
              <h2 class="section__title" data-aos="fade-up">Our Services</h2>
              <div class="services__grid">
                <div class="service-card" data-aos="fade-up">
                  <div class="service-card__icon">
                    <i class="fas fa-laptop-code"></i>
                  </div>
                  <h3 class="service-card__title">Custom Software Development</h3>
                  <p class="service-card__description">
                    Tailored software solutions designed to meet your specific business needs and challenges.
                  </p>
                  <a href="/services/software-development" class="service-card__link">Learn More →</a>
                </div>

                <div class="service-card" data-aos="fade-up" data-aos-delay="100">
                  <div class="service-card__icon">
                    <i class="fas fa-cloud"></i>
                  </div>
                  <h3 class="service-card__title">Cloud Solutions</h3>
                  <p class="service-card__description">
                    Comprehensive cloud services for improved scalability, security, and efficiency.
                  </p>
                  <a href="/services/cloud-solutions" class="service-card__link">Learn More →</a>
                </div>

                <div class="service-card" data-aos="fade-up" data-aos-delay="200">
                  <div class="service-card__icon">
                    <i class="fas fa-mobile-alt"></i>
                  </div>
                  <h3 class="service-card__title">Mobile App Development</h3>
                  <p class="service-card__description">
                    Native and cross-platform mobile applications that deliver exceptional user experiences.
                  </p>
                  <a href="/services/mobile-development" class="service-card__link">Learn More →</a>
                </div>
              </div>
            </div>
          </section>

          <section class="cta" data-aos="fade-up">
            <div class="section__container">
              <h2 class="cta__title">Ready to Transform Your Business?</h2>
              <p class="cta__description">
                Let's discuss how we can help you achieve your technology goals.
              </p>
              <a href="/contact" class="button button--secondary">Schedule a Consultation</a>
            </div>
          </section>
        </main>

        <footer class="footer">
          <div class="footer__container">
            <!-- Top Section: Quick Links and Services -->
            <div class="footer__top">
              <div class="footer__section footer__links">
                <h4 class="footer__subtitle">Quick Links</h4>
                <ul class="footer__nav">
                  <li class="footer__nav-item">
                    <a href="/about" class="footer__link">
                      <i class="fas fa-info-circle footer__link-icon"></i>
                      <span>About Us</span>
                    </a>
                  </li>
                  <li class="footer__nav-item">
                    <a href="/services" class="footer__link">
                      <i class="fas fa-cogs footer__link-icon"></i>
                      <span>Services</span>
                    </a>
                  </li>
                  <li class="footer__nav-item">
                    <a href="/careers" class="footer__link">
                      <i class="fas fa-briefcase footer__link-icon"></i>
                      <span>Careers</span>
                    </a>
                  </li>
                  <li class="footer__nav-item">
                    <a href="/contact" class="footer__link">
                      <i class="fas fa-envelope footer__link-icon"></i>
                      <span>Contact</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div class="footer__section footer__services">
                <h4 class="footer__subtitle">Our Services</h4>
                <ul class="footer__nav">
                  <li class="footer__nav-item">
                    <a href="/services/software-development" class="footer__link">
                      <i class="fas fa-laptop-code footer__link-icon"></i>
                      <span>Software Development</span>
                    </a>
                  </li>
                  <li class="footer__nav-item">
                    <a href="/services/cloud-solutions" class="footer__link">
                      <i class="fas fa-cloud footer__link-icon"></i>
                      <span>Cloud Solutions</span>
                    </a>
                  </li>
                  <li class="footer__nav-item">
                    <a href="/services/mobile-development" class="footer__link">
                      <i class="fas fa-mobile-alt footer__link-icon"></i>
                      <span>Mobile Development</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Middle Section: Company Info -->
            <div class="footer__middle">
              <div class="footer__section footer__company">
                <h3 class="footer__title">Azayd IT Consulting</h3>
                <p class="footer__description">
                  Empowering businesses through innovative IT solutions and expert consulting services in Bengaluru.
                </p>
                <ul class="footer__contact-list">
                  <li class="footer__contact-item">
                    <i class="fas fa-map-marker-alt footer__icon"></i>
                    <div>
                      <strong>Address:</strong>
                      <p>MG Road, Bengaluru</p>
                    </div>
                  </li>
                  <li class="footer__contact-item">
                    <i class="fas fa-envelope footer__icon"></i>
                    <div>
                      <strong>Email:</strong>
                      <p>contact@azayd.com</p>
                    </div>
                  </li>
                  <li class="footer__contact-item">
                    <i class="fas fa-phone footer__icon"></i>
                    <div>
                      <strong>Phone:</strong>
                      <p>+91 XXXXXXXXXX</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Bottom Section: Connect -->
            <div class="footer__bottom-section">
              <div class="footer__section footer__connect">
                <h4 class="footer__subtitle">Connect With Us</h4>
                <div class="footer__social">
                  <a href="https://linkedin.com" class="footer__social-link footer__social-link--linkedin" aria-label="LinkedIn">
                    <i class="fab fa-linkedin"></i>
                    <span class="footer__social-label">LinkedIn</span>
                  </a>
                  <a href="https://twitter.com" class="footer__social-link footer__social-link--twitter" aria-label="Twitter">
                    <i class="fab fa-twitter"></i>
                    <span class="footer__social-label">Twitter</span>
                  </a>
                  <a href="https://facebook.com" class="footer__social-link footer__social-link--facebook" aria-label="Facebook">
                    <i class="fab fa-facebook"></i>
                    <span class="footer__social-label">Facebook</span>
                  </a>
                  <a href="https://instagram.com" class="footer__social-link footer__social-link--instagram" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                    <span class="footer__social-label">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="footer__bottom">
            <div class="footer__bottom-content">
              <p class="footer__copyright">&copy; 2024 Azayd IT Consulting Services. All rights reserved.</p>
              <div class="footer__legal">
                <a href="/privacy" class="footer__legal-link">Privacy Policy</a>
                <a href="/terms" class="footer__legal-link">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  private initializeSecurity(): void {
    // Add CSRF token to all forms
    document.querySelectorAll('form').forEach(form => {
      const csrfToken = Security.generateCSRFToken();
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      input.value = csrfToken;
      form.appendChild(input);
    });

    // Sanitize all form inputs
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = Security.sanitizeInput(target.value);
      });
    });
  }

  private initializeAnimations(): void {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    // GSAP animations
    gsap.from('.hero__title', {
      duration: 1,
      y: 100,
      opacity: 0,
      ease: 'power3.out'
    });

    gsap.from('.hero__subtitle', {
      duration: 1,
      y: 50,
      opacity: 0,
      delay: 0.3,
      ease: 'power3.out'
    });

    // Service cards stagger animation
    gsap.from('.service-card', {
      scrollTrigger: {
        trigger: '.services__grid',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      },
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }

  private setupEventListeners(): void {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');

    navToggle?.addEventListener('click', () => {
      navList?.classList.toggle('nav__list--active');
      navToggle.classList.toggle('nav__toggle--active');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll && currentScroll > 100) {
        header?.classList.add('header--hidden');
      } else {
        header?.classList.remove('header--hidden');
      }

      if (currentScroll > 50) {
        header?.classList.add('header--scrolled');
      } else {
        header?.classList.remove('header--scrolled');
      }

      lastScroll = currentScroll;
    });
  }
}
// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
  new AzaydWebsite();
});