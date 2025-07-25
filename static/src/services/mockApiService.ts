import type { Service, TeamMember, JobPosting, ContactMessage } from './api';
import { mockServices, mockTeamMembers, mockJobPostings } from '../utils/mockData';

// Mock API service that returns the mock data instead of making actual API calls
export const mockApiService = {
  // Services
  getServices: async (): Promise<Service[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockServices), 300); // Simulate network delay
    });
  },

  getService: async (id: number): Promise<Service> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const service = mockServices.find(s => s.id === id);
        if (service) {
          resolve(service);
        } else {
          reject(new Error('Service not found'));
        }
      }, 300);
    });
  },

  // Team members
  getTeamMembers: async (): Promise<TeamMember[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTeamMembers), 300);
    });
  },

  getTeamMember: async (id: number): Promise<TeamMember> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const member = mockTeamMembers.find(m => m.id === id);
        if (member) {
          resolve(member);
        } else {
          reject(new Error('Team member not found'));
        }
      }, 300);
    });
  },

  // Job postings
  getJobPostings: async (): Promise<JobPosting[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockJobPostings), 300);
    });
  },

  getJobPosting: async (id: number): Promise<JobPosting> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const job = mockJobPostings.find(j => j.id === id);
        if (job) {
          resolve(job);
        } else {
          reject(new Error('Job posting not found'));
        }
      }, 300);
    });
  },

  // Contact
  submitContactForm: async (data: ContactMessage): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Contact form submitted:', data);
        resolve();
      }, 500);
    });
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'ok' }), 200);
    });
  }
};

export default mockApiService;