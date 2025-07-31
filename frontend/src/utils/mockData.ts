// Mock data for services, team members, and job postings

export const mockServices = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Modern, responsive websites built with cutting-edge technologies.',
    short_description: 'Modern, responsive websites',
    image: '/images/services/web-dev.svg',
    price: 'From $5,000',
    tech_stack: ['React', 'Vue', 'Angular', 'Node.js', 'Django'],
    features: [
      'Responsive design',
      'SEO optimization',
      'Performance tuning',
      'Content management',
      'E-commerce integration'
    ],
    slug: 'web-development',
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🌐',
    duration: '4-8 weeks'
  },
  {
    id: 2,
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile applications for iOS and Android.',
    short_description: 'Native and cross-platform mobile apps',
    image: '/images/services/mobile-apps.svg',
    price: 'From $8,000',
    tech_stack: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    features: [
      'Cross-platform development',
      'Native performance',
      'Offline functionality',
      'Push notifications',
      'App store optimization'
    ],
    slug: 'mobile-apps',
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '📱',
    duration: '6-12 weeks'
  },
  {
    id: 3,
    title: 'AI Solutions',
    description: 'Intelligent automation and machine learning implementations.',
    short_description: 'Intelligent automation and ML',
    image: '/images/services/ai-solutions.svg',
    price: 'From $10,000',
    tech_stack: ['TensorFlow', 'PyTorch', 'OpenAI', 'Python', 'R'],
    features: [
      'Custom ML models',
      'Natural language processing',
      'Computer vision',
      'Predictive analytics',
      'AI integration with existing systems'
    ],
    slug: 'ai-solutions',
    is_featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🤖',
    duration: '8-16 weeks'
  }
];

export const mockTeamMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    position: 'CEO & Founder',
    bio: 'Alex has over 15 years of experience in software development and business leadership.',
    image: '/images/team/alex.jpg',
    linkedin_url: 'https://linkedin.com/in/alexjohnson',
    twitter_url: 'https://twitter.com/alexjohnson',
    github_url: 'https://github.com/alexjohnson',
    email: 'azayd8752@gmail.com',
    is_leadership: true,
    order: 1,
    skills: ['Leadership', 'Strategy', 'Business Development', 'Software Architecture'],
    years_experience: 15
  },
  {
    id: 2,
    name: 'Sarah Chen',
    position: 'CTO',
    bio: 'Sarah is an expert in cloud architecture and emerging technologies.',
    image: '/images/team/sarah.jpg',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    github_url: 'https://github.com/sarahchen',
    email: 'azayd8752@gmail.com',
    is_leadership: true,
    order: 2,
    skills: ['Cloud Architecture', 'DevOps', 'Kubernetes', 'AWS', 'System Design'],
    years_experience: 12
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    position: 'Lead Developer',
    bio: 'Michael specializes in full-stack development and DevOps practices.',
    image: '/images/team/michael.jpg',
    linkedin_url: 'https://linkedin.com/in/michaelrodriguez',
    github_url: 'https://github.com/michaelrodriguez',
    email: 'azayd8752@gmail.com',
    is_leadership: false,
    order: 3,
    skills: ['React', 'Node.js', 'Python', 'Docker', 'CI/CD'],
    years_experience: 8
  },
  {
    id: 4,
    name: 'Emily Taylor',
    position: 'UX/UI Designer',
    bio: 'Emily creates intuitive and beautiful user experiences.',
    image: '/images/team/emily.jpg',
    linkedin_url: 'https://linkedin.com/in/emilytaylor',
    twitter_url: 'https://twitter.com/emilytaylor',
    email: 'azayd8752@gmail.com',
    is_leadership: false,
    order: 4,
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    years_experience: 6
  }
];

export const mockJobPostings = [
  {
    id: 1,
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for an experienced React developer to join our team.',
    requirements: [
      '5+ years of experience with React',
      'Experience with TypeScript',
      'Knowledge of state management libraries',
      'Experience with testing frameworks'
    ],
    posted_date: '2023-06-15',
    salary_range: '$90,000 - $120,000'
  },
  {
    id: 2,
    title: 'UX Designer',
    department: 'Design',
    location: 'Hybrid',
    type: 'Full-time',
    description: 'Join our design team to create beautiful and functional user interfaces.',
    requirements: [
      '3+ years of UX design experience',
      'Proficiency in Figma or Adobe XD',
      'Understanding of user research methods',
      'Portfolio demonstrating your design process'
    ],
    posted_date: '2023-07-01',
    salary_range: '$80,000 - $100,000'
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help us build and maintain our cloud infrastructure and CI/CD pipelines.',
    requirements: [
      'Experience with AWS or Azure',
      'Knowledge of Docker and Kubernetes',
      'Experience with CI/CD tools',
      'Understanding of infrastructure as code'
    ],
    posted_date: '2023-07-10',
    salary_range: '$95,000 - $125,000'
  }
];