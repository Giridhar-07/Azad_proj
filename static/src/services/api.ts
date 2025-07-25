import axios from 'axios';
import { mockApiService } from './mockApiService';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add timeout and better error handling
api.defaults.timeout = 10000; // 10 seconds timeout

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true; // Set to true to use mock data, false to use real API

// Add CSRF token for Django
const getCsrfToken = (): string | null => {
  // First try to get from cookie
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (cookieValue) {
    return cookieValue;
  }
  
  // Fallback to meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  return metaTag ? metaTag.getAttribute('content') : null;
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
  (response) => {
    // Check if response data is HTML when expecting JSON
    if (response.config.headers['Content-Type'] === 'application/json' && 
        typeof response.data === 'string' && 
        response.data.trim().startsWith('<!DOCTYPE html>')) {
      console.error('Received HTML instead of JSON data');
      return Promise.reject(new Error('Invalid response format: received HTML instead of JSON'));
    }
    return response;
  },
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
  is_leadership?: boolean; // Made optional
  order: number;
  skills?: string[]; // Made optional to resolve type incompatibility
  years_experience?: number; // Made optional
  department?: string; // Added department
  achievements?: string[]; // Added achievements
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
       
       // Check if response data is valid JSON
       if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
         console.error('Received HTML instead of JSON data');
         throw new Error('Invalid response format: received HTML instead of JSON');
       }
       
       // Validate that response.data has the expected structure
       const data = response.data.services || response.data;
       if (!data || !Array.isArray(data)) {
         console.error('Invalid featured services data format:', response.data);
         throw new Error('Invalid featured services data format');
       }
       
       return data;
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
       
       // Check if response data is valid JSON
       if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
         console.error('Received HTML instead of JSON data');
         throw new Error('Invalid response format: received HTML instead of JSON');
       }
       
       // Validate that response.data has the expected structure
       const data = response.data.team_members || response.data;
       if (!data || !Array.isArray(data)) {
         console.error('Invalid team highlights data format:', response.data);
         throw new Error('Invalid team highlights data format');
       }
       
       return data;
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
      
      // Check if response data is valid JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON data');
        throw new Error('Invalid response format: received HTML instead of JSON');
      }
      
      // Validate that response.data has the expected structure
      if (!response.data || (!Array.isArray(response.data) && !Array.isArray(response.data.results))) {
        console.error('Invalid services data format:', response.data);
        throw new Error('Invalid services data format');
      }
      
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

  // Team Members - enhanced with pagination and filtering support
  getTeamMembers: async (params?: { 
    page?: number; 
    role?: string; 
    department?: string;
    search?: string;
    ordering?: string;
  }): Promise<{
    results: TeamMember[];
    count: number;
    next: string | null;
    previous: string | null;
    metadata?: {
      total_active_members: number;
      leadership_count: number;
      departments: string[];
      last_updated: string;
    };
  }> => {
    if (USE_MOCK_DATA) {
      const members = await mockApiService.getTeamMembers();
      return {
        results: members,
        count: members.length,
        next: null,
        previous: null
      };
    }
    try {
      const response = await api.get('/api/team/', { params });
      
      // Check if response data is valid JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON data');
        throw new Error('Invalid response format: received HTML instead of JSON');
      }
      
      // Validate that response.data has the expected structure
      if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
        console.error('Invalid team members data format:', response.data);
        throw new Error('Invalid team members data format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      const members = await mockApiService.getTeamMembers();
      return {
        results: members,
        count: members.length,
        next: null,
        previous: null
      };
    }
  },

  getTeamMember: async (id: number): Promise<TeamMember | null> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getTeamMember(id);
    }
    try {
      const response = await api.get(`/api/team/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team member ${id}:`, error);
      return mockApiService.getTeamMember(id);
    }
  },

  // Team Leadership - get leadership members
  getTeamLeadership: async (): Promise<{
    success: boolean;
    results: TeamMember[];
    count: number;
    message?: string;
  }> => {
    if (USE_MOCK_DATA) {
      const members = await mockApiService.getTeamMembers();
      const leadership = members.filter(member => member.is_leadership);
      return {
        success: true,
        results: leadership,
        count: leadership.length
      };
    }
    try {
      const response = await api.get('/api/team/leadership/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team leadership:', error);
      return {
        success: false,
        results: [],
        count: 0,
        message: 'Failed to fetch leadership team'
      };
    }
  },

  // Team Departments - get all departments and roles
  getTeamDepartments: async (): Promise<{
    success: boolean;
    departments: string[];
    roles: string[];
    metadata?: {
      total_departments: number;
      total_roles: number;
      last_updated: string;
    };
  }> => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        departments: ['Engineering', 'Design', 'Marketing', 'Operations'],
        roles: ['Developer', 'Designer', 'Manager', 'Analyst']
      };
    }
    try {
      const response = await api.get('/api/team/departments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team departments:', error);
      return {
        success: false,
        departments: [],
        roles: []
      };
    }
  },

  // Team Statistics - comprehensive team stats
  getTeamStats: async (): Promise<{
    success: boolean;
    stats?: {
      total_members: number;
      leadership_count: number;
      departments_count: number;
      experience_distribution: { [key: string]: number };
      average_experience: number;
      total_skills: number;
    };
    last_updated?: string;
  }> => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        stats: {
          total_members: 25,
          leadership_count: 5,
          departments_count: 4,
          experience_distribution: {
            'Junior (0-2 years)': 8,
            'Mid-level (3-5 years)': 10,
            'Senior (6+ years)': 7
          },
          average_experience: 4.2,
          total_skills: 45
        }
      };
    }
    try {
      const response = await api.get('/api/team/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return {
        success: false
      };
    }
  },

  // Team Highlights - get featured team members for about page
  getEnhancedTeamHighlights: async (): Promise<{
    success: boolean;
    results: TeamMember[];
    metadata?: {
      total_highlighted: number;
      selection_criteria: string;
      last_updated: string;
    };
  }> => {
    if (USE_MOCK_DATA) {
      const members = await mockApiService.getTeamMembers();
      const highlights = members.slice(0, 6);
      return {
        success: true,
        results: highlights,
        metadata: {
          total_highlighted: highlights.length,
          selection_criteria: 'leadership_and_experience',
          last_updated: new Date().toISOString()
        }
      };
    }
    try {
      const response = await api.get('/api/team/highlights/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team highlights:', error);
      return {
        success: false,
        results: []
      };
    }
  },

  // Job Postings - enhanced with filtering
  getJobPostings: async (params?: { page?: number; department?: string; location?: string }): Promise<JobPosting[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getJobPostings();
    }
    try {
      const response = await api.get('/api/jobs/', { params });
      
      // Check if response data is valid JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON data');
        throw new Error('Invalid response format: received HTML instead of JSON');
      }
      
      // Validate that response.data has the expected structure
      const data = response.data.results || response.data;
      if (!data || !Array.isArray(data)) {
        console.error('Invalid job postings data format:', response.data);
        throw new Error('Invalid job postings data format');
      }
      
      return data;
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
      const response = await api.get(`/api/jobs/${id}/`);
      
      // Check if response data is valid JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON data');
        throw new Error('Invalid response format: received HTML instead of JSON');
      }
      
      // Validate that response.data has the expected structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid job posting data format:', response.data);
        throw new Error('Invalid job posting data format');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching job posting ${id}:`, error);
      // Fallback to mock data
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

  // Resume submission - for career applications
  submitResumeForm: async (data: FormData): Promise<{ success: boolean; message?: string }> => {
    if (USE_MOCK_DATA) {
      try {
        // Mock successful submission
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return { success: true, message: 'Resume submitted successfully!' };
      } catch (error) {
        return { success: false, message: 'Failed to submit resume' };
      }
    }
    try {
      // Get CSRF token and add it to FormData if not already present
      const csrfToken = getCsrfToken();
      if (csrfToken && !data.has('csrfmiddlewaretoken')) {
        data.append('csrfmiddlewaretoken', csrfToken);
      }
      
      // For FormData, let the browser set the Content-Type with boundary
      const config = {
        headers: {
          'X-CSRFToken': csrfToken || ''
        }
      };
      const response = await api.post('/api/contact/resume/', data, config);
      return { success: true, message: response.data.message || 'Resume submitted successfully!' };
    } catch (error: any) {
      console.error('Error submitting resume:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit resume. Please try again.' 
      };
    }
  },

  // Job application submission
  submitJobApplication: async (data: FormData): Promise<{ 
    success: boolean; 
    message?: string; 
    data?: { id: number; job_title: string; submitted_at: string };
    errors?: any;
  }> => {
    if (USE_MOCK_DATA) {
      try {
        // Mock successful submission
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return { 
          success: true, 
          message: 'Your application has been submitted successfully. We will review it and get back to you soon!',
          data: {
            id: 123,
            job_title: 'Mock Job Position',
            submitted_at: new Date().toISOString()
          }
        };
      } catch (error) {
        return { success: false, message: 'Failed to submit application' };
      }
    }
    try {
      // Get CSRF token and add it to FormData if not already present
      const csrfToken = getCsrfToken();
      if (csrfToken && !data.has('csrfmiddlewaretoken')) {
        data.append('csrfmiddlewaretoken', csrfToken);
      }
      
      // For FormData, let the browser set the Content-Type with boundary
      const config = {
        headers: {
          'X-CSRFToken': csrfToken || ''
        },
        // Increase timeout for file uploads
        timeout: 30000 // 30 seconds
      };
      
      const response = await api.post('/api/jobs/apply/', data, config);
      
      // Check if response data is valid JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON data');
        throw new Error('Invalid response format: received HTML instead of JSON');
      }
      
      return { 
        success: response.data.status === 'success', 
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error submitting job application:', error);
      
      // Network errors
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Network error. Please check your internet connection and try again.',
          errors: { _error: 'Network error' }
        };
      }
      
      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out. The server might be busy, please try again later.',
          errors: { _error: 'Request timeout' }
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit application. Please try again.',
        errors: error.response?.data?.errors
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
