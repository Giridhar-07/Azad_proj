import { Security } from '../utils/security';
import { findLocalResponse } from '../utils/localResponses';
import { OpenRouterAPI } from '../utils/openRouterApi';

export class Chatbot {
  private container!: HTMLElement;
  private messages!: HTMLElement;
  private isOpen: boolean = false;
  private conversationHistory: { role: string; content: string }[] = [];
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private isWaitingForResponse: boolean = false;
  private streamingResponse: boolean = false;
  private currentMessageElement: HTMLElement | null = null;
  private scene: any;
  private camera: any;
  private renderer: any;
  private cube: any;
  private animationFrameId: number | null = null;

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
    this.initializeAnimations();
    this.initialize3D();
  }

  private async handleAIResponse(message: string, retryCount = 0): Promise<string> {
    if (this.isWaitingForResponse) {
      return "I'm still processing your previous message. Please wait a moment.";
    }

    this.isWaitingForResponse = true;
    this.streamingResponse = true;

    try {
      // First, check for local responses
      const localResponse = findLocalResponse(message);
      if (localResponse) {
        return this.simulateStreamingResponse(localResponse);
      }

      // Prepare conversation context
      this.updateConversationHistory('user', message);
      const messages = OpenRouterAPI.prepareConversationContext(this.conversationHistory);
      
      // Get streaming response with enhanced error handling
      try {
        const response = await OpenRouterAPI.generateResponse(messages);
        if (response && response.trim()) {
          // For OpenRouter API, simulate streaming display
          await this.simulateStreamingResponse(response);
          return response;
        } else {
          throw new Error('Empty response from AI service');
        }
      } catch (apiError) {
        console.error('OpenRouter API Error:', apiError);
        
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.handleAIResponse(message, retryCount + 1);
        }
        
        // Provide a more helpful fallback response
        return this.generateFallbackResponse(message);
      }

    } catch (error: any) {
      console.error('AI response error:', error);

      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.handleAIResponse(message, retryCount + 1);
      }

      return this.getFallbackResponse(message);

    } finally {
      this.isWaitingForResponse = false;
      this.streamingResponse = false;
    }
  }

  private generateFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! While I'm having trouble with my AI service, I can still assist you with information about Azayd IT Consulting. Try asking about our services, contact information, or pricing. For complex queries, please contact us directly at contact@azayd.com.";
    }
    
    if (message.includes('service') || message.includes('what') || message.includes('do')) {
      return "Azayd IT Consulting offers comprehensive IT services including Web Development, Mobile Apps, Cloud Solutions, AI & Machine Learning, DevOps, and Cybersecurity. Would you like to know more about any specific service?";
    }
    
    if (message.includes('contact') || message.includes('reach')) {
      return "You can reach us at:\n\n📧 Email: contact@azayd.com\n📞 Phone: +91 XXXXXXXXXX\n📍 Office: MG Road, Bengaluru\n\nWe're here to help with all your IT consulting needs!";
    }
    
    return "Thank you for your question! While I'm having trouble with my AI service right now, I'd be happy to connect you with our team who can provide detailed answers. Please contact us at contact@azayd.com or call +91 XXXXXXXXXX for immediate assistance.";
  }

  private async simulateStreamingResponse(response: string): Promise<string> {
    // Simulate streaming for local responses
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < response.length) {
          const chunk = response.charAt(index);
          this.appendToCurrentMessage(chunk);
          index++;
        } else {
          clearInterval(interval);
          resolve(response);
        }
      }, 20); // Adjust speed as needed
    });
  }

  private appendToCurrentMessage(text: string): void {
    if (!this.currentMessageElement) return;
    
    const contentDiv = this.currentMessageElement.querySelector('.chatbot__message-content');
    if (contentDiv) {
      contentDiv.textContent += text;
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }

  private getFallbackResponse(message: string): string {
    const localResponse = findLocalResponse(message);
    if (localResponse) {
      return localResponse;
    }
    
    // Use the same intelligent fallback logic
    return this.generateFallbackResponse(message);
  }

  private updateConversationHistory(role: string, content: string): void {
    this.conversationHistory.push({ role, content });
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  private showTypingIndicator(): void {
    const typing = this.container.querySelector('.chatbot__typing') as HTMLElement;
    if (typing) {
      typing.style.display = 'flex';
    }
  }

  private hideTypingIndicator(): void {
    const typing = this.container.querySelector('.chatbot__typing') as HTMLElement;
    if (typing) {
      typing.style.display = 'none';
    }
  }

  private setupEventListeners(): void {
    const toggle = this.container.querySelector('.chatbot__toggle');
    const close = this.container.querySelector('.chatbot__close');
    const form = this.container.querySelector('.chatbot__input-form');
    const input = this.container.querySelector('.chatbot__input') as HTMLInputElement;

    toggle?.addEventListener('click', () => this.toggleChat());
    close?.addEventListener('click', () => this.toggleChat());

    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form?.dispatchEvent(new Event('submit'));
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isWaitingForResponse) {
        return;
      }

      const message = Security.sanitizeInput(input.value.trim());

      if (message) {
        this.addMessage('user', message);
        input.value = '';
        input.disabled = true;
        
        this.showTypingIndicator();
        this.currentMessageElement = this.createEmptyBotMessage();
        this.hideTypingIndicator();
        
        try {
          const aiResponse = await this.handleAIResponse(message);
          if (aiResponse) {
            this.updateConversationHistory('assistant', aiResponse);
          }
        } catch (error) {
          console.error('Error handling AI response:', error);
          this.appendToCurrentMessage('\n\nI apologize, but I encountered an error. Please try again.');
        }
        
        input.disabled = false;
        input.focus();
      }
    });
  }

  private toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('chatbot--open', this.isOpen);
    
    if (this.isOpen) {
      this.addMessage('bot', 'Hello! How can I assist you today with our IT consulting services?');
      const input = this.container.querySelector('.chatbot__input') as HTMLInputElement;
      setTimeout(() => input?.focus(), 300);
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  private createEmptyBotMessage(): HTMLElement {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot__message chatbot__message--bot`;
    
    messageEl.innerHTML = `
      <div class="chatbot__message-avatar">
        <lottie-player
          src="https://assets9.lottiefiles.com/packages/lf20_xyadoh9h.json"
          background="transparent"
          speed="1"
          style="width: 24px; height: 24px;"
          loop
          autoplay
        ></lottie-player>
      </div>
      <div class="chatbot__message-content"></div>
    `;

    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    this.messages.appendChild(messageEl);

    requestAnimationFrame(() => {
      messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    });

    this.messages.scrollTop = this.messages.scrollHeight;
    return messageEl;
  }

  private addMessage(type: 'user' | 'bot', content: string): void {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot__message chatbot__message--${type}`;
    
    if (type === 'bot') {
      messageEl.innerHTML = `
        <div class="chatbot__message-avatar">
          <lottie-player
            src="https://assets9.lottiefiles.com/packages/lf20_xyadoh9h.json"
            background="transparent"
            speed="1"
            style="width: 24px; height: 24px;"
            loop
            autoplay
          ></lottie-player>
        </div>
        <div class="chatbot__message-content">${content}</div>
      `;
    } else {
      messageEl.innerHTML = `<div class="chatbot__message-content">${content}</div>`;
    }

    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    this.messages.appendChild(messageEl);

    requestAnimationFrame(() => {
      messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    });

    this.messages.scrollTop = this.messages.scrollHeight;
  }

  private initializeUI(): void {
    this.container = document.createElement('div');
    this.container.className = 'chatbot';
    this.container.innerHTML = `
      <button class="chatbot__toggle" aria-label="Toggle chat">
        <div class="chatbot__toggle-3d">
          <canvas class="chatbot__canvas"></canvas>
        </div>
        <span>Chat with AI</span>
      </button>
      <div class="chatbot__window">
        <div class="chatbot__header">
          <div class="chatbot__header-info">
            <lottie-player
              src="https://assets9.lottiefiles.com/packages/lf20_xyadoh9h.json"
              background="transparent"
              speed="1"
              style="width: 30px; height: 30px;"
              loop
              autoplay
            ></lottie-player>

          </div>
          <button class="chatbot__close" aria-label="Close chat">&times;</button>
        </div>
        <div class="chatbot__messages"></div>
        <div class="chatbot__typing" style="display: none;">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="chatbot__error" style="display: none;">
          <p>Connection lost. Retrying...</p>
        </div>
        <form class="chatbot__input-form">
          <input 
            type="text" 
            placeholder="Type your message..." 
            class="chatbot__input"
            aria-label="Chat message"
          >
          <button type="submit" class="chatbot__send" aria-label="Send message">
            <lottie-player
              src="https://assets3.lottiefiles.com/packages/lf20_ng26pbap.json"
              background="transparent"
              speed="1"
              style="width: 24px; height: 24px;"
              loop
              autoplay
            ></lottie-player>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(this.container);
    this.messages = this.container.querySelector('.chatbot__messages')!;

    // Add custom styles for 3D toggle button
    const style = document.createElement('style');
    style.textContent = `
      .chatbot__toggle {
        width: auto;
        height: auto;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem 0.5rem 0.5rem;
        border-radius: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
      
      .chatbot__toggle-3d {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.2);
      }
      
      .chatbot__canvas {
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  private initialize3D(): void {
    try {
      // Import Three.js properly
      import('three').then((THREE) => {
        const canvasElement = this.container.querySelector('.chatbot__canvas');
        if (!canvasElement) return;
        
        // Initialize Three.js with the imported module
        this.setupThreeJsScene(THREE, canvasElement);
      }).catch(error => {
        console.error('Failed to load Three.js:', error);
      });
    } catch (error) {
      console.error('Error initializing 3D:', error);
    }
  }

  private setupThreeJsScene(THREE: any, canvasElement: Element): void {
    if (!canvasElement) return;

    // Create scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvasElement as HTMLCanvasElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(40, 40);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create cube with gradient material
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x667eea }),
      new THREE.MeshBasicMaterial({ color: 0x764ba2 }),
      new THREE.MeshBasicMaterial({ color: 0xf093fb }),
      new THREE.MeshBasicMaterial({ color: 0xf5576c }),
      new THREE.MeshBasicMaterial({ color: 0x4facfe }),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe })
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);
    this.camera.position.z = 2.5;

    // Add wireframe
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0xffffff);
    line.material.transparent = true;
    line.material.opacity = 0.3;
    this.scene.add(line);

    // Initial render
    this.renderer.render(this.scene, this.camera);
  }

  private startAnimation(): void {
    if (this.animationFrameId) return;

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      if (this.cube) {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private initializeAnimations(): void {
    const toggle = this.container.querySelector('.chatbot__toggle');
    if (toggle) {
      toggle.addEventListener('mouseenter', () => {
        this.startAnimation();
        const lottiePlayer = toggle.querySelector('lottie-player');
        if (lottiePlayer) {
          lottiePlayer.setAttribute('speed', '1.5');
        }
      });

      toggle.addEventListener('mouseleave', () => {
        if (!this.isOpen) {
          this.stopAnimation();
        }
        const lottiePlayer = toggle.querySelector('lottie-player');
        if (lottiePlayer) {
          lottiePlayer.setAttribute('speed', '1');
        }
      });
    }
  }
}