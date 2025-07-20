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
}

export class OpenRouterAPI {
  private static API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  private static API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static MODEL = 'anthropic/claude-3-opus:beta';
  private static SITE_URL = window.location.origin;
  private static SITE_NAME = 'Azayd IT Consulting';

  // Rate limiting properties
  private static requestsInLastMinute = 0;
  private static lastRequestTime = 0;
  private static readonly MAX_REQUESTS_PER_MINUTE = 10;
  private static readonly COOLDOWN_PERIOD = 60000; // 1 minute

  /**
   * Check if we can make a request based on rate limiting
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
   * Prepare the conversation context for the API request
   */
  public static prepareConversationContext(history: Message[]): Message[] {
    // Ensure the conversation has a system message at the beginning
    const hasSystemMessage = history.some(msg => msg.role === 'system');
    
    const messages = [...history];
    
    if (!hasSystemMessage) {
      messages.unshift({
        role: 'system',
        content: `You are an AI assistant for ${this.SITE_NAME}, a professional IT consulting company. 
        Provide helpful, accurate, and professional responses. Be concise but thorough.
        Current date: ${new Date().toLocaleDateString()}`
      });
    }
    
    return messages;
  }

  /**
   * Generate a response using the OpenRouter API
   */
  public static async generateResponse(messages: Message[]): Promise<string> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    if (!this.API_KEY) {
      console.error('OpenRouter API key is not set');
      return 'I\'m sorry, but I\'m not configured correctly. Please contact support.';
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': this.SITE_URL,
          'X-Title': this.SITE_NAME
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json() as OpenRouterResponse;
      return data.choices[0]?.message?.content || 'I\'m sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Stream a response from the OpenRouter API
   */
  public static async streamResponse(messages: Message[], onChunk: (chunk: string) => void): Promise<string> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    if (!this.API_KEY) {
      console.error('OpenRouter API key is not set');
      return 'I\'m sorry, but I\'m not configured correctly. Please contact support.';
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': this.SITE_URL,
          'X-Title': this.SITE_NAME
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

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
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error streaming response:', error);
      throw error;
    }
  }
}