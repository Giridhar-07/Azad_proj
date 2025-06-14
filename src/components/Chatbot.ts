import { Security } from '../utils/security';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findLocalResponse } from '../utils/localResponses';
export class Chatbot {
  private container!: HTMLElement;
  private messages!: HTMLElement;
  private isOpen: boolean = false;
  private conversationHistory: { role: string; content: string }[] = [];
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private isWaitingForResponse: boolean = false;
  private genAI!: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
    this.initializeAnimations();
    this.initializeGemini();
  }

  private initializeGemini(): void {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('Gemini API key not found');
      return;
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  private async handleAIResponse(message: string, retryCount = 0): Promise<string> {
    if (this.isWaitingForResponse) {
      return "I'm still processing your previous message. Please wait a moment.";
    }

    this.isWaitingForResponse = true;

    try {
      // First, check for local responses
      const localResponse = findLocalResponse(message);
      if (localResponse) {
        return localResponse;
      }

      // If Gemini is available, use it
      if (this.model) {
        const context = `You are an IT consulting assistant for Azayd IT Consulting. 
          Previous conversation: ${this.prepareConversationContext(message)}
          
          Respond professionally and concisely about our IT services.
          Current question: ${message}`;

        const result = await this.model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        if (text && text.length > 0) {
          this.updateConversationHistory('assistant', text);
          return text;
        }
      }

      // If we reach here, use local fallback
      return this.getFallbackResponse(message);

    } catch (error: any) {
      console.error('AI response error:', error);

      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.handleAIResponse(message, retryCount + 1);
      }

      return this.getFallbackResponse(message);

    } finally {
      this.isWaitingForResponse = false;
    }
  }

  private getFallbackResponse(message: string): string {
    const localResponse = findLocalResponse(message);
    if (localResponse) {
      return localResponse;
    }
    
    return "I apologize, but I'm currently experiencing connectivity issues. " +
           "Please email us at contact@azayd.com or call us at +91 XXXXXXXXXX " +
           "for immediate assistance. Alternatively, you can try rephrasing your question.";
  }

  private prepareConversationContext(message: string): string {
    this.updateConversationHistory('user', message);
    return this.conversationHistory
      .slice(-4)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
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
        const aiResponse = await this.handleAIResponse(message);
        this.hideTypingIndicator();
        
        this.addMessage('bot', aiResponse);
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
    }
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
        <lottie-player
          src="https://assets5.lottiefiles.com/packages/lf20_u25cckyh.json"
          background="transparent"
          speed="1"
          style="width: 40px; height: 40px;"
          loop
          autoplay
        ></lottie-player>
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
            <h3>Azayd AI Assistant</h3>
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
  }

  private initializeAnimations(): void {
    const toggle = this.container.querySelector('.chatbot__toggle');
    if (toggle) {
      toggle.addEventListener('mouseenter', () => {
        const lottiePlayer = toggle.querySelector('lottie-player');
        if (lottiePlayer) {
          lottiePlayer.setAttribute('speed', '1.5');
        }
      });

      toggle.addEventListener('mouseleave', () => {
        const lottiePlayer = toggle.querySelector('lottie-player');
        if (lottiePlayer) {
          lottiePlayer.setAttribute('speed', '1');
        }
      });
    }
  }
}