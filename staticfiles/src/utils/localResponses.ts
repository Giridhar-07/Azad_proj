interface Response {
  keywords: string[];
  response: string;
  routes?: { text: string; path: string }[];
}

export const localResponses: Response[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! Welcome to Azayd IT Consulting. I'm here to help you with information about our IT services, answer your questions, or assist with general inquiries. How can I help you today?",
    routes: [
      { text: "View our services", path: "/services" },
      { text: "Contact us", path: "/contact" }
    ]
  },
  {
    keywords: ['services', 'offer', 'provide', 'what do you do', 'capabilities'],
    response: "We offer comprehensive IT consulting services:\n\n🔹 **Web Development** - Modern, responsive websites and web applications\n🔹 **Mobile App Development** - Native and cross-platform apps for iOS/Android\n🔹 **Cloud Solutions** - AWS, Azure, Google Cloud migration and management\n🔹 **AI & Machine Learning** - Custom AI solutions and data analytics\n🔹 **DevOps & Automation** - CI/CD pipelines and infrastructure automation\n🔹 **Cybersecurity** - Security audits, encryption, and protection strategies\n🔹 **Digital Transformation** - Complete business digitization\n\nWhich service interests you most?",
    routes: [
      { text: "Explore our services", path: "/services" }
    ]
  },
  {
    keywords: ['contact', 'reach', 'email', 'phone', 'get in touch', 'call'],
    response: "📧 **Email**: azayd8752@gmail.com\n📞 **Phone**: +91 XXXXXXXXXX\n📍 **Office**: MG Road, Bengaluru, India\n\nWe serve clients globally through our remote services. Would you like me to help you schedule a consultation or connect you with our team?",
    routes: [
      { text: "Contact us", path: "/contact" }
    ]
  },
  {
    keywords: ['price', 'cost', 'pricing', 'rates', 'budget', 'quote'],
    response: "Our pricing is customized based on your specific project requirements and scope. We offer:\n\n💰 Competitive rates\n🎯 Tailored solutions\n📊 Transparent pricing\n🔄 Flexible engagement models\n\nFor an accurate quote, I'd recommend scheduling a consultation where we can discuss your needs in detail. Would you like me to help arrange that?",
    routes: [
      { text: "Contact for pricing", path: "/contact" },
      { text: "View services", path: "/services" }
    ]
  },
  {
    keywords: ['location', 'office', 'address', 'where', 'based', 'headquarters'],
    response: "🏢 **Headquarters**: MG Road, Bengaluru, India\n🌍 **Service Area**: We serve clients across India and globally\n💻 **Remote Services**: Available worldwide\n\nOur strategic location in Bengaluru's tech hub allows us to leverage top talent while serving clients internationally.",
    routes: [
      { text: "Contact us", path: "/contact" },
      { text: "About our company", path: "/about" }
    ]
  },
  {
    keywords: ['cloud', 'aws', 'azure', 'hosting', 'migration', 'google cloud'],
    response: "☁️ **Cloud Solutions We Offer:**\n\n🔹 **Cloud Migration** - Seamless transition to cloud platforms\n🔹 **Multi-Cloud Management** - AWS, Azure, Google Cloud expertise\n🔹 **Cloud Optimization** - Cost reduction and performance enhancement\n🔹 **Infrastructure as Code** - Automated provisioning and management\n🔹 **Cloud Security** - Robust protection and compliance\n\nWhat specific cloud challenges are you facing?",
    routes: [
      { text: "Cloud services details", path: "/services" },
      { text: "Contact our cloud experts", path: "/contact" }
    ]
  },
  {
    keywords: ['mobile', 'app', 'android', 'ios', 'application'],
    response: "📱 **Mobile App Development:**\n\n🔹 **Native Development** - iOS (Swift) and Android (Kotlin/Java)\n🔹 **Cross-Platform** - React Native, Flutter\n🔹 **UI/UX Design** - User-centered design approach\n🔹 **App Store Optimization** - Launch and marketing support\n🔹 **Maintenance & Updates** - Ongoing support\n\nWhat type of mobile app are you planning to develop?",
    routes: [
      { text: "Mobile app services", path: "/services" },
      { text: "Contact for app development", path: "/contact" }
    ]
  },
  {
    keywords: ['web', 'website', 'development', 'frontend', 'backend'],
    response: "🌐 **Web Development Services:**\n\n🔹 **Frontend** - React, Vue.js, Angular, modern responsive design\n🔹 **Backend** - Node.js, Python, Java, .NET\n🔹 **Full-Stack Solutions** - End-to-end development\n🔹 **E-commerce** - Custom online stores and marketplaces\n🔹 **Performance Optimization** - Fast, scalable applications\n\nWhat kind of web solution are you looking for?",
    routes: [
      { text: "Web development services", path: "/services" },
      { text: "Contact for web projects", path: "/contact" }
    ]
  },
  {
    keywords: ['security', 'secure', 'protection', 'cybersecurity', 'safety'],
    response: "🔒 **Cybersecurity Services:**\n\n🔹 **Security Audits** - Comprehensive vulnerability assessments\n🔹 **Penetration Testing** - Ethical hacking and security validation\n🔹 **Encryption Solutions** - Data protection at rest and in transit\n🔹 **Authentication Systems** - Multi-factor and secure access\n🔹 **Compliance** - GDPR, HIPAA, SOC 2 compliance support\n\nWhat security concerns can I help address?",
    routes: [
      { text: "Cybersecurity services", path: "/services" },
      { text: "Contact security experts", path: "/contact" }
    ]
  },
  {
    keywords: ['consultation', 'meeting', 'discuss', 'schedule', 'appointment'],
    response: "📅 **Schedule a Consultation:**\n\nI'd be happy to help you connect with our experts! You can:\n\n🔹 **Email us**: azayd8752@gmail.com\n🔹 **Visit our Contact page** for the consultation form\n🔹 **Call directly**: +91 XXXXXXXXXX\n\nOur consultations are free and we'll discuss your specific requirements, timeline, and how we can help achieve your goals.",
    routes: [
      { text: "Schedule a consultation", path: "/contact" }
    ]
  },
  {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'data'],
    response: "🤖 **AI & Machine Learning Services:**\n\n🔹 **Custom AI Solutions** - Tailored AI applications\n🔹 **Data Analytics** - Business intelligence and insights\n🔹 **Machine Learning Models** - Predictive analytics and automation\n🔹 **Natural Language Processing** - Chatbots and text analysis\n🔹 **Computer Vision** - Image and video processing\n\nWhat AI challenges are you looking to solve?",
    routes: [
      { text: "AI & ML services", path: "/services" },
      { text: "Contact our AI experts", path: "/contact" }
    ]
  },
  {
    keywords: ['devops', 'automation', 'deployment', 'ci/cd', 'infrastructure'],
    response: "⚙️ **DevOps & Automation:**\n\n🔹 **CI/CD Pipelines** - Automated testing and deployment\n🔹 **Infrastructure as Code** - Terraform, CloudFormation\n🔹 **Container Orchestration** - Docker, Kubernetes\n🔹 **Monitoring & Logging** - Comprehensive system observability\n🔹 **Performance Optimization** - Scalable infrastructure solutions\n\nHow can we streamline your development and deployment processes?",
    routes: [
      { text: "DevOps services", path: "/services" },
      { text: "Contact our DevOps team", path: "/contact" }
    ]
  },
  {
    keywords: ['code', 'example', 'sample', 'programming', 'syntax'],
    response: "Here's an example of how we structure our code at Azayd IT Consulting:\n\n```javascript\n// Modern JavaScript with clean architecture principles\nclass UserService {\n  constructor(userRepository) {\n    this.userRepository = userRepository;\n  }\n\n  async getUserById(id) {\n    try {\n      const user = await this.userRepository.findById(id);\n      if (!user) {\n        throw new Error('User not found');\n      }\n      return user;\n    } catch (error) {\n      console.error('Error fetching user:', error);\n      throw error;\n    }\n  }\n}\n```\n\nWe follow best practices like:\n\n1. **Clean Architecture** - Separation of concerns\n2. **Error Handling** - Proper error management\n3. **Async/Await** - Modern asynchronous patterns\n4. **Dependency Injection** - For better testability\n\nWould you like to see more examples of our coding standards?",
    routes: [
      { text: "Our development services", path: "/services" },
      { text: "Contact our developers", path: "/contact" }
    ]
  },
  {
    keywords: ['markdown', 'formatting', 'text', 'style'],
    response: "# Text Formatting Examples\n\nAt Azayd IT Consulting, we use various formatting styles in our documentation:\n\n## Emphasis\n*Italic text* for subtle emphasis\n**Bold text** for strong emphasis\n\n## Lists\n### Ordered List\n1. First item\n2. Second item\n3. Third item\n\n### Unordered List\n- Point one\n- Point two\n- Point three\n\n## Code\nInline `code` for short snippets\n\n```python\ndef hello_world():\n    print('Hello from Azayd IT Consulting!')\n```\n\n## Blockquotes\n> Important information or quotes can be highlighted like this.\n> Multiple lines work too.\n\nThis demonstrates our attention to detail in documentation.",
    routes: [
      { text: "Our documentation services", path: "/services" },
      { text: "Contact us", path: "/contact" }
    ]
  }
];

export interface LocalResponseResult {
  response: string;
  routes?: { text: string; path: string }[];
}

export function findLocalResponse(input: string): LocalResponseResult | null {
  const normalizedInput = input.toLowerCase();
  
  // Find the most relevant response based on keyword matches
  let bestMatch: { response: Response; matches: number } | null = null;
  
  for (const item of localResponses) {
    const matches = item.keywords.filter(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0 && (!bestMatch || matches > bestMatch.matches)) {
      bestMatch = { response: item, matches };
    }
  }
  
  return bestMatch ? {
    response: bestMatch.response.response,
    routes: bestMatch.response.routes
  } : null;
}