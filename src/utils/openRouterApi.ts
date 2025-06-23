import { Security } from './security';

interface Message {
  role: string;
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  object: string;
}

export class OpenRouterAPI {
  private static API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
  private static API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';
  private static SITE_URL = window.location.origin;
  private static SITE_NAME = 'Azayd IT Consulting';
  
  // Debug logging
  static {
    console.log('OpenRouter API Configuration:');
    console.log('API Key (first 10 chars):', this.API_KEY.substring(0, 10) + '...');
    console.log('Model:', this.MODEL);
    console.log('Environment variables loaded:', {
      VITE_OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY ? 'Present' : 'Missing',
      VITE_OPENROUTER_MODEL: import.meta.env.VITE_OPENROUTER_MODEL || 'Not set'
    });
  }
  
  // Rate limiting
  private static lastRequestTime: number = 0;
  private static requestsInLastMinute: number = 0;
  private static MAX_REQUESTS_PER_MINUTE: number = 5;
  private static COOLDOWN_PERIOD: number = 60000; // 1 minute in milliseconds

  /**
   * Check if we're within rate limits
   */
  private static checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if more than a minute has passed
    if (now - this.lastRequestTime > this.COOLDOWN_PERIOD) {
      this.requestsInLastMinute = 0;
      this.lastRequestTime = now;
      return true;
    }
    
    // Check if we've exceeded the rate limit
    if (this.requestsInLastMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    this.requestsInLastMinute++;
    this.lastRequestTime = now;
    return true;
  }

  /**
   * Generate a response using the Deepseek API
   */
  public static async generateResponse(messages: Message[]): Promise<string> {
    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.SITE_URL,
          'X-Title': this.SITE_NAME,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API Response Error:');
        console.error('Status:', response.status, response.statusText);
        console.error('Headers:', Object.fromEntries(response.headers.entries()));
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error Response Body:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
          const textError = await response.text();
          console.error('Error Response Text:', textError);
          throw new Error(`API Error ${response.status}: ${textError}`);
        }
        
        const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
        
        if (response.status === 401) {
          throw new Error(`Authentication Error (401): ${errorMessage}. Please check:\n1. API key is valid and not expired\n2. Model training is enabled in OpenRouter settings\n3. Account has sufficient credits\n4. Try using a different model like deepseek/deepseek-v3`);
        }
        
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
      }

      // Handle streaming response
      if (!response.body) {
        throw new Error('Response body is null');
      }

      return this.handleStreamResponse(response);
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  /**
   * Handle streaming response from the API
   */
  private static async handleStreamResponse(response: Response): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              result += content;
            } catch (e) {
              console.error('Error parsing JSON from stream:', e);
            }
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Stream reading error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Prepare conversation context with enhanced system prompt
   */
  public static prepareConversationContext(messages: Message[]): Message[] {
    // Add system message at the beginning if not present
    if (messages.length === 0 || messages[0].role !== 'system') {
      return [
        {
          role: 'system',
          content: `You are an AI assistant for Azayd IT Consulting, a leading IT consulting company. Here's comprehensive information about our company:

**Company Overview:**
- Name: Azayd IT Consulting
- Location: MG Road, Bengaluru, India
- Contact: contact@azayd.com, +91 XXXXXXXXXX
- Website: ${this.SITE_URL}

**Our Services:**
1. **Web Development**: Modern, responsive websites and web applications using latest technologies
2. **Mobile App Development**: Native and cross-platform mobile apps for iOS and Android
3. **Cloud Solutions**: Migration, optimization, and management across AWS, Azure, and Google Cloud
4. **AI & Machine Learning**: Custom AI solutions, data analytics, and machine learning implementations
5. **DevOps & Automation**: CI/CD pipelines, infrastructure automation, and deployment optimization
6. **Cybersecurity**: Security audits, encryption, secure authentication, and protection strategies
7. **Digital Transformation**: Complete business digitization and process optimization
8. **Custom Software Development**: Tailored software solutions for specific business needs

**Key Features:**
- Competitive pricing with customized solutions
- Global service delivery with remote capabilities
- Industry-best security practices
- Scalable and high-performance solutions
- Expert team with latest technology expertise

**Instructions:**
- Provide helpful, accurate, and professional responses
- For website-specific questions, use the above company information
- For general questions, provide comprehensive and helpful answers
- Keep responses conversational but professional
- Suggest scheduling consultations when appropriate
- Always maintain a helpful and solution-oriented tone`
        },
        ...messages
      ];
    }
    
    return messages;
  }
}