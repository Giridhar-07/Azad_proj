interface Message {
  role: string;
  content: string;
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
}

export class GeminiAPI {
  private static API_URL = '/api/proxy/gemini/';
  private static MODEL = 'gemini-1.5-flash-latest';
  private static SITE_URL = window.location.origin;
  private static SITE_NAME = 'Azayd IT Consulting';

  // Rate limiting properties
  private static requestsInLastMinute = 0;
  private static lastRequestTime = 0;
  private static readonly MAX_REQUESTS_PER_MINUTE = 15; // Gemini has different rate limits
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
   * Convert OpenRouter-style messages to Gemini format
   */
  private static convertMessagesToGeminiFormat(messages: Message[]) {
    const contents = [];
    let systemInstruction = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        systemInstruction = message.content;
      } else {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }
    
    return { contents, systemInstruction };
  }

  /**
   * Generate a response using the Gemini API
   */
  public static async generateResponse(messages: Message[]): Promise<string> {
    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const { contents, systemInstruction } = this.convertMessagesToGeminiFormat(messages);
      
      const requestBody: any = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };
      
      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'same-origin' // Include cookies for CSRF protection
      });

      if (!response.ok) {
        console.error('Gemini API Response Error:');
        console.error('Status:', response.status, response.statusText);
        
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
          throw new Error(`Authentication Error (401): ${errorMessage}. Please check your Gemini API key.`);
        }
        
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded (429): ${errorMessage}. Please try again later.`);
        }
        
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated by Gemini API');
      }
      
      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      return candidate.content.parts[0].text || '';
      
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
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
- Contact: azayd8752@gmail.com, +91 XXXXXXXXXX
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
