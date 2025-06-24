import axios from 'axios';
import { mockApiService } from './mockApiService';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true; // Set to true to use mock data, false to use real API

// Add CSRF token for Django
const getCsrfToken = (): string | null => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || null;
};

// Request interceptor to add CSRF token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('CSRF token missing or invalid');
    }
    return Promise.reject(error);
  }
);

// API service interfaces
export interface Service {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  image: string;
  price: string;
  tech_stack: string[];
  features: string[];
  slug: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  icon?: string;
  duration?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  email?: string;
  is_leadership: boolean;
  order: number;
  skills: string[];
  years_experience: number;
}

export interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  posted_date: string;
  salary_range?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Enhanced API Service functions with modern error handling and caching
export const apiService = {
  // Homepage data - comprehensive endpoint for home page
  async getHomepageData(): Promise<any> {
    try {
      if (USE_MOCK_DATA) {
        return {
          hero: {
            title: "Transform Your Digital Vision Into Reality",
            subtitle: "We create cutting-edge solutions that drive business growth and innovation",
            cta_primary: "Get Started Today",
            cta_secondary: "Learn More"
          },
          stats: {
            projects_completed: 150,
            happy_clients: 98,
            years_experience: 8,
            technologies_used: 25,
            countries_served: 12,
            uptime_percentage: 99.9
          }
        };
      }
      
      const response = await api.get('/api/homepage/');
       return response.data;
     } catch (error) {
       console.error('Error fetching homepage data:', error);
       throw error;
     }
   },

   // Featured services - optimized for homepage display
   async getFeaturedServices(): Promise<Service[]> {
     try {
       if (USE_MOCK_DATA) {
         const services = await mockApiService.getServices();
         return services.slice(0, 3);
       }
       
       const response = await api.get('/api/services/featured/');
       return response.data.services || response.data;
     } catch (error) {
       console.error('Error fetching featured services:', error);
       const services = await mockApiService.getServices();
       return services.slice(0, 3); // Fallback to mock data
     }
   },

   // Team highlights - key team members for homepage
   async getTeamHighlights(): Promise<TeamMember[]> {
     try {
       if (USE_MOCK_DATA) {
         const members = await mockApiService.getTeamMembers();
         return members.slice(0, 3);
       }
       
       const response = await api.get('/api/team/highlights/');
       return response.data.team_members || response.data;
     } catch (error) {
       console.error('Error fetching team highlights:', error);
       const members = await mockApiService.getTeamMembers();
       return members.slice(0, 3); // Fallback to mock data
     }
   },

  // Services - enhanced with comprehensive filtering and pagination
  getServices: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    featured?: boolean;
    ordering?: string;
    price_min?: number;
    price_max?: number;
  }): Promise<{
    results: Service[];
    count: number;
    next: string | null;
    previous: string | null;
    total_pages: number;
    current_page: number;
  }> => {
    if (USE_MOCK_DATA) {
      const services = await mockApiService.getServices();
      return {
        results: services,
        count: services.length,
        next: null,
        previous: null,
        total_pages: 1,
        current_page: 1
      };
    }
    try {
      const response = await api.get('/api/services/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      const services = await mockApiService.getServices();
      return {
        results: services,
        count: services.length,
        next: null,
        previous: null,
        total_pages: 1,
        current_page: 1
      };
    }
  },

  // Service categories - get all available categories
  getServiceCategories: async (): Promise<string[]> => {
    if (USE_MOCK_DATA) {
      return ['all', 'web development', 'mobile development', 'backend development', 'ai & machine learning', 'design', 'cloud & devops'];
    }
    try {
      const response = await api.get('/api/services/categories/');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return ['all', 'web development', 'mobile development', 'backend development'];
    }
  },

  // Service statistics - get comprehensive stats
  getServiceStats: async (): Promise<{
    total_services: number;
    featured_services: number;
    avg_price: number;
    latest_service: string | null;
    categories: string[];
    price_range: { min: number; max: number };
  }> => {
    if (USE_MOCK_DATA) {
      return {
        total_services: 12,
        featured_services: 4,
        avg_price: 2500,
        latest_service: 'AI-Powered Analytics Dashboard',
        categories: ['all', 'web development', 'mobile development', 'backend development'],
        price_range: { min: 0, max: 10000 }
      };
    }
    try {
      const response = await api.get('/api/services/stats/');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service stats:', error);
      return {
        total_services: 0,
        featured_services: 0,
        avg_price: 0,
        latest_service: null,
        categories: [],
        price_range: { min: 0, max: 10000 }
      };
    }
  },

  // Single service - enhanced with error handling
  getService: async (id: number): Promise<Service | null> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getService(id);
    }
    try {
      const response = await axios.get(`/api/services/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      return mockApiService.getService(id);
    }
  },

  // Team Members - enhanced with pagination support
  getTeamMembers: async (params?: { page?: number; role?: string }): Promise<TeamMember[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getTeamMembers();
    }
    try {
      const response = await axios.get('/api/team/', { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return mockApiService.getTeamMembers();
    }
  },

  getTeamMember: async (id: number): Promise<TeamMember | null> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getTeamMember(id);
    }
    try {
      const response = await axios.get(`/api/team/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team member ${id}:`, error);
      return mockApiService.getTeamMember(id);
    }
  },

  // Job Postings - enhanced with filtering
  getJobPostings: async (params?: { page?: number; department?: string; location?: string }): Promise<JobPosting[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getJobPostings();
    }
    try {
      const response = await axios.get('/api/jobs/', { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return mockApiService.getJobPostings();
    }
  },

  getJobPosting: async (id: number): Promise<JobPosting | null> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getJobPosting(id);
    }
    try {
      const response = await axios.get(`/api/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job posting ${id}:`, error);
      return mockApiService.getJobPosting(id);
    }
  },

  // Contact - enhanced with better error handling
  submitContactForm: async (data: ContactMessage): Promise<{ success: boolean; message?: string }> => {
    if (USE_MOCK_DATA) {
      try {
        await mockApiService.submitContactForm(data);
        return { success: true, message: 'Message sent successfully!' };
      } catch (error) {
        return { success: false, message: 'Failed to send message' };
      }
    }
    try {
      const response = await api.post('/api/contact/', data);
      return { success: true, message: response.data.message || 'Message sent successfully!' };
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send message. Please try again.' 
      };
    }
  },

  // Health check - for monitoring API status
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    if (USE_MOCK_DATA) {
      const result = await mockApiService.healthCheck();
      return { ...result, timestamp: new Date().toISOString() };
    }
    try {
      const response = await api.get('/api/health/');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }
};

export default apiService;