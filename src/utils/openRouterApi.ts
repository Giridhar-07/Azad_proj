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
  private static API_KEY = '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';
  private static API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static MODEL = 'deepseek/deepseek-r1-0528:free';
  private static SITE_URL = window.location.origin;
  private static SITE_NAME = 'Azayd IT Consulting';
  
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
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
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
   * Prepare conversation context with system prompt
   */
  public static prepareConversationContext(messages: Message[]): Message[] {
    // Add system message at the beginning if not present
    if (messages.length === 0 || messages[0].role !== 'system') {
      return [
        {
          role: 'system',
          content: 'You are an AI assistant for Azayd IT Consulting. Provide helpful, accurate, and professional responses about our IT services including Web Development, Mobile Development, Cloud Solutions, AI & Machine Learning, DevOps & Automation, and Cybersecurity. Keep responses concise and relevant to IT consulting.'
        },
        ...messages
      ];
    }
    
    return messages;
  }
}