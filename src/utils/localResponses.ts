interface Response {
  keywords: string[];
  response: string;
}

export const localResponses: Response[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! Welcome to Azayd IT Consulting. How can I assist you today?"
  },
  {
    keywords: ['services', 'offer', 'provide'],
    response: "We offer a range of IT consulting services including: Custom Software Development, Cloud Solutions, Mobile App Development, and Digital Transformation. Which service would you like to know more about?"
  },
  {
    keywords: ['contact', 'reach', 'email', 'phone'],
    response: "You can reach us via email at contact@azayd.com, call us at +91 XXXXXXXXXX, or visit our office in MG Road, Bengaluru. Would you like me to help you schedule a consultation?"
  },
  {
    keywords: ['price', 'cost', 'pricing', 'rates'],
    response: "Our pricing varies based on project requirements and scope. We offer competitive rates and customized solutions. Would you like to schedule a consultation to discuss your specific needs?"
  },
  {
    keywords: ['location', 'office', 'address', 'where'],
    response: "Our office is located in MG Road, Bengaluru. We serve clients across India and globally through our remote services."
  },
  {
    keywords: ['cloud', 'aws', 'azure', 'hosting'],
    response: "We provide comprehensive cloud solutions including migration, optimization, and management across major platforms like AWS, Azure, and Google Cloud. What specific cloud services are you interested in?"
  },
  {
    keywords: ['mobile', 'app', 'android', 'ios'],
    response: "We develop native and cross-platform mobile applications for both iOS and Android. Our team uses the latest technologies to ensure high performance and great user experience."
  },
  {
    keywords: ['web', 'website', 'development'],
    response: "We create modern, responsive websites and web applications using the latest technologies. Our solutions are scalable, secure, and optimized for performance."
  },
  {
    keywords: ['security', 'secure', 'protection'],
    response: "Security is our top priority. We implement industry-best practices for cybersecurity, including encryption, secure authentication, and regular security audits."
  },
  {
    keywords: ['consultation', 'meeting', 'discuss'],
    response: "We'd be happy to schedule a consultation to discuss your project. You can book a meeting through our contact page or email us at contact@azayd.com."
  }
];

export function findLocalResponse(input: string): string | null {
  const normalizedInput = input.toLowerCase();
  
  // Find the most relevant response based on keyword matches
  let bestMatch: { response: string; matches: number } | null = null;
  
  for (const item of localResponses) {
    const matches = item.keywords.filter(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0 && (!bestMatch || matches > bestMatch.matches)) {
      bestMatch = { response: item.response, matches };
    }
  }
  
  return bestMatch ? bestMatch.response : null;
}