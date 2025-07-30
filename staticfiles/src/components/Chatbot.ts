import { Security } from '../utils/security';
import { findLocalResponse, LocalResponseResult } from '../utils/localResponses';
import { GeminiAPI } from '../utils/GeminiAPI';

// Ensure GeminiAPI has streamChatResponse as async iterable if not present
// This is a fallback shim if needed
if (!('streamChatResponse' in GeminiAPI)) {
  (GeminiAPI as any).streamChatResponse = async function* (prompt: string) {
    const fullResponse = await this.generateChatResponse(prompt);
    let currentIndex = 0;
    const chunkSize = 20;
    while (currentIndex < fullResponse.length) {
      yield fullResponse.slice(currentIndex, currentIndex + chunkSize);
      currentIndex += chunkSize;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };
}
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class Chatbot {
  // Added chat generation format and streaming response handling
  private messageQueue: string[] = [];
  private isStreaming: boolean = false;

  // Method to start chat session
  startChat() {
    this.isOpen = true;
    this.render();
  }

  // Method to send user message and receive streamed response
  async sendMessage(message: string) {
    if (this.isWaitingForResponse) return;
    this.isWaitingForResponse = true;
    this.addMessage('user', message);

    try {
      // Simulate streaming response from GeminiAPI
      this.isStreaming = true;
      this.currentMessageElement = this.createMessageElement('assistant');
      this.messages.appendChild(this.currentMessageElement);

      if (typeof GeminiAPI.streamChatResponse !== 'function') {
        GeminiAPI.streamChatResponse = async function* (msg: string) {
          const response = await GeminiAPI.generateResponse([{ role: 'user', content: msg }]);
          yield response;
        };
      }
      if (typeof GeminiAPI.streamChatResponse !== 'function') {
        GeminiAPI.streamChatResponse = async function* (msg: string) {
          const response = await GeminiAPI.generateResponse([{ role: 'user', content: msg }]);
          yield response;
        };
      }
      if (typeof GeminiAPI.streamChatResponse !== 'function') {
        GeminiAPI.streamChatResponse = async function* (msg: string) {
          const response = await GeminiAPI.generateResponse([{ role: 'user', content: msg }]);
          yield response;
        };
      }
      const stream = GeminiAPI.streamChatResponse(message);
      for await (const chunk of stream) {
        this.appendToCurrentMessage(chunk);
      }

      this.isStreaming = false;
      this.isWaitingForResponse = false;
    } catch (error) {
      this.addMessage('assistant', 'Sorry, something went wrong.');
      this.isWaitingForResponse = false;
    }
  }

  private addMessage(role: string, content: string) {
    // Add message to conversation history and render
    this.conversationHistory.push({ role, content });
    this.render();
  }

  private createMessageElement(role: string): HTMLElement {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    return messageEl;
  }

  private async appendToCurrentMessage(text: string | Promise<string>): Promise<void> {
    if (!this.currentMessageElement) return;

    const contentDiv = this.currentMessageElement.querySelector('.chatbot__message-content');
    if (contentDiv) {
      const resolvedText = await text;
      const currentText = contentDiv.textContent || '';
      const newText = currentText + resolvedText;
      const processedContent = this.processMessageContent(newText);
      if (processedContent instanceof Promise) {
        const html = await processedContent;
        contentDiv.innerHTML = html;
        this.scrollToBottom();
      } else {
        contentDiv.innerHTML = processedContent;
        this.scrollToBottom();
      }
    }
  }

  private scrollToBottom() {
    if (this.messages) {
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }

  private render() {
    // Render conversation history
    if (!this.messages) return;
    this.messages.innerHTML = '';
    this.conversationHistory.forEach(msg => {
      const msgEl = this.createMessageElement(msg.role);
      const parsedContent = marked.parse(msg.content);
      if (parsedContent instanceof Promise) {
        parsedContent.then(html => {
          msgEl.innerHTML = DOMPurify.sanitize(html);
        });
      } else {
        msgEl.innerHTML = DOMPurify.sanitize(parsedContent);
      }
      this.messages.appendChild(msgEl);
    });
    this.scrollToBottom();
  }

  // ... existing code ...

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

  private async handleAIResponse(message: string, retryCount = 0): Promise<{ text: string; routes?: { text: string; path: string }[] }> {
    if (this.isWaitingForResponse) {
      return { text: "I'm still processing your previous message. Please wait a moment." };
    }

    this.isWaitingForResponse = true;
    this.streamingResponse = true;

    try {
      // First, check for local responses
      const localResponseResult = findLocalResponse(message);
      if (localResponseResult) {
        await this.simulateStreamingResponse(localResponseResult.response);
        return { 
          text: localResponseResult.response,
          routes: localResponseResult.routes 
        };
      }

      // Prepare conversation context
      this.updateConversationHistory('user', message);
      const messages = GeminiAPI.prepareConversationContext(this.conversationHistory);
      
      // Get streaming response with enhanced error handling
      try {
        const response = await GeminiAPI.generateResponse(messages);
        if (response && response.trim()) {
          // For Gemini API, simulate streaming display
          await this.simulateStreamingResponse(response);
          return { text: response };
        } else {
          throw new Error('Empty response from AI service');
        }
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.handleAIResponse(message, retryCount + 1);
        }
        
        // Provide a more helpful fallback response
        const fallbackResponse = this.generateFallbackResponse(message);
        return { text: fallbackResponse };
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
      return "I'm here to help! While I'm having trouble with my AI service, I can still assist you with information about Azayd IT Consulting. Try asking about our services, contact information, or pricing. For complex queries, please contact us directly at azayd8752@gmail.com.";
    }
    
    if (message.includes('service') || message.includes('what') || message.includes('do')) {
      return "Azayd IT Consulting offers comprehensive IT services including Web Development, Mobile Apps, Cloud Solutions, AI & Machine Learning, DevOps, and Cybersecurity. Would you like to know more about any specific service?";
    }
    
    if (message.includes('contact') || message.includes('reach')) {
      return "You can reach us at:\n\n📧 Email: azayd8752@gmail.com\n📞 Phone: +91 XXXXXXXXXX\n📍 Office: MG Road, Bengaluru\n\nWe're here to help with all your IT consulting needs!";
    }
    
    return "Thank you for your question! While I'm having trouble with my AI service right now, I'd be happy to connect you with our team who can provide detailed answers. Please contact us at azayd8752@gmail.com or call +91 XXXXXXXXXX for immediate assistance.";
  }

  private async simulateStreamingResponse(response: string): Promise<string> {
    // Simulate streaming for local responses
    return new Promise((resolve) => {
      // For better markdown rendering, we'll stream in larger chunks
      const chunkSize = 5; // Characters per chunk
      let index = 0;
      const interval = setInterval(() => {
        if (index < response.length) {
          // Get the next chunk of text
          const endIndex = Math.min(index + chunkSize, response.length);
          const chunk = response.substring(index, endIndex);
          this.appendToCurrentMessage(chunk);
          index = endIndex;
        } else {
          clearInterval(interval);
          
          // Final processing of the complete message to ensure proper markdown rendering
          if (this.currentMessageElement) {
            const contentDiv = this.currentMessageElement.querySelector('.chatbot__message-content');
            if (contentDiv) {
              const processedContent = this.processMessageContent(response);
              
              // Handle both synchronous and asynchronous return types
              if (processedContent instanceof Promise) {
                processedContent.then(html => {
                  contentDiv.innerHTML = html;
                  this.messages.scrollTop = this.messages.scrollHeight;
                });
              } else {
                contentDiv.innerHTML = processedContent;
                this.messages.scrollTop = this.messages.scrollHeight;
              }
            }
          }
          
          resolve(response);
        }
      }, 20); // Adjust speed as needed
    });
  }

  private appendToCurrentMessage(text: string | Promise<string>): void {
    if (!this.currentMessageElement) return;
    
    const contentDiv = this.currentMessageElement.querySelector('.chatbot__message-content');
    if (contentDiv) {
      // Store the current text content
      const currentText = contentDiv.textContent || '';
      // Append the new text
      const newText = currentText + text;
      // Process the entire message with markdown
      const processedContent = this.processMessageContent(newText);
      
      // Handle both synchronous and asynchronous return types
      if (processedContent instanceof Promise) {
        processedContent.then(html => {
          contentDiv.innerHTML = html;
          this.messages.scrollTop = this.messages.scrollHeight;
        });
      } else {
        contentDiv.innerHTML = processedContent;
        this.messages.scrollTop = this.messages.scrollHeight;
      }
    }
  }

  private getFallbackResponse(message: string): { text: string; routes?: { text: string; path: string }[] } {
    const localResponseResult = findLocalResponse(message);
    if (localResponseResult) {
      return {
        text: localResponseResult.response,
        routes: localResponseResult.routes
      };
    }
    
    // Use the same intelligent fallback logic
    return { text: this.generateFallbackResponse(message) };
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
            // Add the bot message with text and routes
            this.addMessage('bot', aiResponse);
            // Only store the text in conversation history
            this.updateConversationHistory('assistant', aiResponse.text);
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
      this.addMessage('bot', {
        text: 'Hello! How can I assist you today with our IT consulting services?',
        routes: [
          { text: "View our services", path: "/services" },
          { text: "Contact us", path: "/contact" }
        ]
      });
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
      <div class="chatbot__message-content" data-markdown-content="true"></div>
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

  private addMessage(type: 'user' | 'bot', content: string | { text: string; routes?: { text: string; path: string }[] }): void {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot__message chatbot__message--${type}`;
    
    // Handle both string content and object with text and routes
    const messageText = typeof content === 'string' ? content : content.text;
    const routes = typeof content === 'string' ? undefined : content.routes;
    
    if (type === 'bot') {
      // Process markdown and sanitize HTML
      const processedContent = this.processMessageContent(messageText);
      
      // Create the message element structure
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'chatbot__message-avatar';
      avatarDiv.innerHTML = `
        <lottie-player
          src="https://assets9.lottiefiles.com/packages/lf20_xyadoh9h.json"
          background="transparent"
          speed="1"
          style="width: 24px; height: 24px;"
          loop
          autoplay
        ></lottie-player>
      `;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'chatbot__message-content';
      
      // Append the elements to the message
      messageEl.appendChild(avatarDiv);
      messageEl.appendChild(contentDiv);
      
      // Handle both synchronous and asynchronous return types
      if (processedContent instanceof Promise) {
        // If it's a Promise, update the content when resolved
        processedContent.then(html => {
          contentDiv.innerHTML = html;
        });
      } else {
        // If it's a string, set the content immediately
        contentDiv.innerHTML = processedContent;
      }
      
      // Add links if routes are provided
      if (routes && routes.length > 0) {
        const routesContainer = document.createElement('div');
        routesContainer.className = 'routes-container';
        
        // Add each route as a link
        routes.forEach(route => {
          const link = document.createElement('a');
          link.href = route.path;
          link.className = 'chatbot__link';
          link.textContent = route.text;
          routesContainer.appendChild(link);
        });
        
        // Append the routes container to the message
        messageEl.appendChild(routesContainer);
      }
    } else {
      // For user messages, just sanitize the content
      const sanitizedText = DOMPurify.sanitize(messageText);
      messageEl.innerHTML = `<div class="chatbot__message-content">${sanitizedText}</div>`;
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
  
  /**
   * Process message content to render markdown, code blocks, and hyperlinks
   * @returns HTML string or Promise<string> if marked is in async mode
   */
  private processMessageContent(text: string): string | Promise<string> {
    // Update your marked configuration
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
      pedantic: false,
      silent: false
    });
    
    // Enhance the renderer for better formatting
    const renderer = new marked.Renderer();
    
    
    
    // Improve code block rendering
    renderer.code = function({ text, lang, escaped }: { text: string, lang?: string, escaped?: boolean }): string {
      const highlightedCode = text; // Return plain text since no syntax highlighting function is defined
      return `<pre><code class="language-${lang || 'plaintext'}">${highlightedCode}</code></pre>`;
    };
    
    // Improve list rendering
    renderer.list = function(token: any): string {
      const type = token.ordered ? 'ol' : 'ul';
      const startAttr = (token.ordered && token.start !== '' && token.start !== 1) ? ` start="${token.start}"` : '';
      let body = '';
      
      // Process each list item
      if (token.items) {
        for (const item of token.items) {
          body += this.listitem(item);
        }
      }
      
      return `<${type}${startAttr} class="chatbot-${type}">${body}</${type}>`;
    };
    
    // Improve table rendering
    renderer.table = function(token: any): string {
      let header = '';
      let body = '';
      
      // Process header
      if (token.header && token.header.length) {
        header = '<tr>';
        for (const cell of token.header) {
          header += this.tablecell(cell);
        }
        header += '</tr>';
      }
      
      // Process rows
      if (token.rows) {
        for (const row of token.rows) {
          let rowHtml = '<tr>';
          for (const cell of row) {
            rowHtml += this.tablecell(cell);
          }
          rowHtml += '</tr>';
          body += rowHtml;
        }
      }
      
      return `<table class="chatbot-table">\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;
    };
    
    const parsedContent = marked.parse(text, { renderer });
    
    // Handle both synchronous and asynchronous return types
    if (parsedContent instanceof Promise) {
      // If it's a Promise, we need to return a Promise
      return parsedContent.then(html => {
        // Sanitize HTML to prevent XSS
        const sanitizedHtml = DOMPurify.sanitize(html);
        
        // Process special patterns like URLs not in markdown
        return this.processSpecialPatterns(sanitizedHtml);
      });
    } else {
      // If it's a string, process it synchronously
      // Sanitize HTML to prevent XSS
      const html = DOMPurify.sanitize(parsedContent);
      
      // Process special patterns like URLs not in markdown
      return this.processSpecialPatterns(html);
    }
  }
  
  /**
   * Process special patterns in text that aren't handled by markdown
   */
  private processSpecialPatterns(html: string): string {
    // Convert plain URLs to clickable links if they're not already in an <a> tag
    const urlRegex = /(https?:\/\/[^\s<]+)(?![^<]*>|[^<>]*<\/a>)/g;
    html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return html;
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