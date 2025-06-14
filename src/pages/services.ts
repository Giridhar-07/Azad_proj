// Remove framer-motion and AOS imports since they're causing type errors
// and aren't properly supported in vanilla TypeScript
import '../styles/main.css';

// Define Export
export class Export {
  // ... class definition ...
}

// Use Export
const exportInstance = new Export();
console.log(exportInstance);

class ServicesPage {
  constructor() {
    this.initializeDOM();
    this.initializeAnimations();
  }

  private initializeDOM(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="page">
        <!-- Header component will be included -->
        <main class="main">
          <section class="services-hero">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              class="services-hero__content"
            >
              <h1>Our Services</h1>
              <p>Comprehensive IT solutions tailored to your business needs</p>
            </motion.div>
          </section>

          <section class="services-grid">
            <div class="service-card" data-aos="fade-up">
              <div class="service-card__icon">
                <lottie-player
                  src="https://assets2.lottiefiles.com/packages/lf20_iorpbol0.json"
                  background="transparent"
                  speed="1"
                  style="width: 100px; height: 100px;"
                  loop
                  autoplay
                ></lottie-player>
              </div>
              <h3>Custom Software Development</h3>
              <p>Tailored solutions that perfectly align with your business processes</p>
              <ul>
                <li>Web Applications</li>
                <li>Enterprise Software</li>
                <li>API Integration</li>
                <li>Legacy System Modernization</li>
              </ul>
            </div>

            <!-- Add more service cards -->
          </section>

          <section class="tech-stack">
            <h2>Our Technology Stack</h2>
            <div class="tech-grid">
              <!-- Add technology icons with animations -->
            </div>
          </section>
        </main>
        <!-- Footer component will be included -->
      </div>
    `;
    
  }
  private initializeAnimations(): void {
    import('aos').then(AOS => {
      AOS.default.init({
        duration: 1000,
        once: true,
        offset: 100
      });

      // Add scroll-triggered animations
      const serviceCards = document.querySelectorAll('.service-card');
      serviceCards.forEach((card, index) => {
        (card as HTMLElement).style.animationDelay = `${index * 0.2}s`;
      });
    });
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  new ServicesPage();
});