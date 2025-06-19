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
    const response = await axios.get('/api/services/');
    return response.data;
  },

  getService: async (id: number): Promise<Service> => {
    const response = await axios.get(`/api/services/${id}/`);
    return response.data;
  },

  // Team members
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await axios.get('/api/team/');
    return response.data;
  },

  getTeamMember: async (id: number): Promise<TeamMember> => {
    const response = await axios.get(`/api/team/${id}/`);
    return response.data;
  },

  // Job postings
  getJobPostings: async (): Promise<JobPosting[]> => {
    const response = await axios.get('/api/jobs/');
    return response.data;
  },

  getJobPosting: async (id: number): Promise<JobPosting> => {
    const response = await axios.get(`/api/jobs/${id}/`);
    return response.data;
  },

  // Contact
  submitContactForm: async (data: ContactMessage): Promise<void> => {
    await axios.post('/api/contact/', data);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await axios.get('/api/health/');
    return response.data;
  }
};

export default apiService;