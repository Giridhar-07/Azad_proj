import axios from 'axios';
import { mockApiService } from './mockApiService';

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

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
axios.interceptors.request.use(
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
axios.interceptors.response.use(
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
  image: string;
  price: string;
  tech_stack: string[];
  features: string[];
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

// API service functions
export const apiService = {
  // Services
  getServices: async (): Promise<Service[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getServices();
    }
    try {
      const response = await axios.get('/api/services/');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      return mockApiService.getServices();
    }
  },

  getService: async (id: number): Promise<Service> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getService(id);
    }
    try {
      const response = await axios.get(`/api/services/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return mockApiService.getService(id);
    }
  },

  // Team members
  getTeamMembers: async (): Promise<TeamMember[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getTeamMembers();
    }
    try {
      const response = await axios.get('/api/team/');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return mockApiService.getTeamMembers();
    }
  },

  getTeamMember: async (id: number): Promise<TeamMember> => {
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

  // Job postings
  getJobPostings: async (): Promise<JobPosting[]> => {
    if (USE_MOCK_DATA) {
      return mockApiService.getJobPostings();
    }
    try {
      const response = await axios.get('/api/jobs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return mockApiService.getJobPostings();
    }
  },

  getJobPosting: async (id: number): Promise<JobPosting> => {
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

  // Contact
  submitContactForm: async (data: ContactMessage): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockApiService.submitContactForm(data);
    }
    try {
      await axios.post('/api/contact/', data);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return mockApiService.submitContactForm(data);
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    if (USE_MOCK_DATA) {
      return mockApiService.healthCheck();
    }
    try {
      const response = await axios.get('/api/health/');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return mockApiService.healthCheck();
    }
  }
};

export default apiService;