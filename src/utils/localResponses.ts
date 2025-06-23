interface Response {
  keywords: string[];
  response: string;
}

export const localResponses: Response[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! Welcome to Azayd IT Consulting. I'm here to help you with information about our IT services, answer your questions, or assist with general inquiries. How can I help you today?"
  },
  {
    keywords: ['services', 'offer', 'provide', 'what do you do', 'capabilities'],
    response: "We offer comprehensive IT consulting services:\n\n🔹 **Web Development** - Modern, responsive websites and web applications\n🔹 **Mobile App Development** - Native and cross-platform apps for iOS/Android\n🔹 **Cloud Solutions** - AWS, Azure, Google Cloud migration and management\n🔹 **AI & Machine Learning** - Custom AI solutions and data analytics\n🔹 **DevOps & Automation** - CI/CD pipelines and infrastructure automation\n🔹 **Cybersecurity** - Security audits, encryption, and protection strategies\n🔹 **Digital Transformation** - Complete business digitization\n\nWhich service interests you most?"
  },
  {
    keywords: ['contact', 'reach', 'email', 'phone', 'get in touch', 'call'],
    response: "📧 **Email**: contact@azayd.com\n📞 **Phone**: +91 XXXXXXXXXX\n📍 **Office**: MG Road, Bengaluru, India\n\nWe serve clients globally through our remote services. Would you like me to help you schedule a consultation or connect you with our team?"
  },
  {
    keywords: ['price', 'cost', 'pricing', 'rates', 'budget', 'quote'],
    response: "Our pricing is customized based on your specific project requirements and scope. We offer:\n\n💰 Competitive rates\n🎯 Tailored solutions\n📊 Transparent pricing\n🔄 Flexible engagement models\n\nFor an accurate quote, I'd recommend scheduling a consultation where we can discuss your needs in detail. Would you like me to help arrange that?"
  },
  {
    keywords: ['location', 'office', 'address', 'where', 'based', 'headquarters'],
    response: "🏢 **Headquarters**: MG Road, Bengaluru, India\n🌍 **Service Area**: We serve clients across India and globally\n💻 **Remote Services**: Available worldwide\n\nOur strategic location in Bengaluru's tech hub allows us to leverage top talent while serving clients internationally."
  },
  {
    keywords: ['cloud', 'aws', 'azure', 'hosting', 'migration', 'google cloud'],
    response: "☁️ **Cloud Solutions We Offer:**\n\n🔹 **Cloud Migration** - Seamless transition to cloud platforms\n🔹 **Multi-Cloud Management** - AWS, Azure, Google Cloud expertise\n🔹 **Cloud Optimization** - Cost reduction and performance enhancement\n🔹 **Infrastructure as Code** - Automated provisioning and management\n🔹 **Cloud Security** - Robust protection and compliance\n\nWhat specific cloud challenges are you facing?"
  },
  {
    keywords: ['mobile', 'app', 'android', 'ios', 'application'],
    response: "📱 **Mobile App Development:**\n\n🔹 **Native Development** - iOS (Swift) and Android (Kotlin/Java)\n🔹 **Cross-Platform** - React Native, Flutter\n🔹 **UI/UX Design** - User-centered design approach\n🔹 **App Store Optimization** - Launch and marketing support\n🔹 **Maintenance & Updates** - Ongoing support\n\nWhat type of mobile app are you planning to develop?"
  },
  {
    keywords: ['web', 'website', 'development', 'frontend', 'backend'],
    response: "🌐 **Web Development Services:**\n\n🔹 **Frontend** - React, Vue.js, Angular, modern responsive design\n🔹 **Backend** - Node.js, Python, Java, .NET\n🔹 **Full-Stack Solutions** - End-to-end development\n🔹 **E-commerce** - Custom online stores and marketplaces\n🔹 **Performance Optimization** - Fast, scalable applications\n\nWhat kind of web solution are you looking for?"
  },
  {
    keywords: ['security', 'secure', 'protection', 'cybersecurity', 'safety'],
    response: "🔒 **Cybersecurity Services:**\n\n🔹 **Security Audits** - Comprehensive vulnerability assessments\n🔹 **Penetration Testing** - Ethical hacking and security validation\n🔹 **Encryption Solutions** - Data protection at rest and in transit\n🔹 **Authentication Systems** - Multi-factor and secure access\n🔹 **Compliance** - GDPR, HIPAA, SOC 2 compliance support\n\nWhat security concerns can I help address?"
  },
  {
    keywords: ['consultation', 'meeting', 'discuss', 'schedule', 'appointment'],
    response: "📅 **Schedule a Consultation:**\n\nI'd be happy to help you connect with our experts! You can:\n\n🔹 **Email us**: contact@azayd.com\n🔹 **Visit our Contact page** for the consultation form\n🔹 **Call directly**: +91 XXXXXXXXXX\n\nOur consultations are free and we'll discuss your specific requirements, timeline, and how we can help achieve your goals."
  },
  {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'data'],
    response: "🤖 **AI & Machine Learning Services:**\n\n🔹 **Custom AI Solutions** - Tailored AI applications\n🔹 **Data Analytics** - Business intelligence and insights\n🔹 **Machine Learning Models** - Predictive analytics and automation\n🔹 **Natural Language Processing** - Chatbots and text analysis\n🔹 **Computer Vision** - Image and video processing\n\nWhat AI challenges are you looking to solve?"
  },
  {
    keywords: ['devops', 'automation', 'deployment', 'ci/cd', 'infrastructure'],
    response: "⚙️ **DevOps & Automation:**\n\n🔹 **CI/CD Pipelines** - Automated testing and deployment\n🔹 **Infrastructure as Code** - Terraform, CloudFormation\n🔹 **Container Orchestration** - Docker, Kubernetes\n🔹 **Monitoring & Logging** - Comprehensive system observability\n🔹 **Performance Optimization** - Scalable infrastructure solutions\n\nHow can we streamline your development and deployment processes?"
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