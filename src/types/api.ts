/**
 * API Type Definitions for AZAYD Application
 * 
 * This file contains TypeScript interfaces and types for all API-related data structures.
 * These types ensure type safety across the frontend-backend communication.
 * 
 * @author AZAYD Development Team
 * @version 1.0.0
 */

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination Interface
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  total_pages: number;
  current_page: number;
  page_size: number;
}

// Service Related Types
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

export interface ServiceStats {
  total_services: number;
  featured_services: number;
  avg_price: number;
  popular_technologies: string[];
}

// Team Member Types
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
  is_leadership?: boolean;
  order: number;
  skills?: string[];
  years_experience?: number;
  department?: string;
  achievements?: string[];
}

// Job Posting Types
export interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_range?: string;
  posted_date: string;
  application_deadline?: string;
  is_active: boolean;
  tags: string[];
  slug: string;
}

// Contact Message Types
export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  service_interest?: string;
  budget_range?: string;
  timeline?: string;
}

export interface ContactResponse {
  id: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  response_time_estimate: string;
}

// Homepage Data Structure
export interface HomePageData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta_primary: string;
    cta_secondary: string;
    background_video?: string;
    stats: CompanyStats;
  };
  featured_services: Service[];
  team_highlights: TeamMember[];
  recent_projects: Project[];
  testimonials: Testimonial[];
  company_stats: CompanyStats;
  latest_news: NewsItem[];
}

// Company Statistics
export interface CompanyStats {
  projects_completed: number;
  happy_clients: number;
  years_experience: number;
  team_members: number;
  technologies_used: number;
  countries_served: number;
  uptime_percentage: number;
  response_time_hours: number;
}

// Project Types
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  client: string;
  category: string;
  technologies: string[];
  completion_date: string;
  project_url?: string;
  github_url?: string;
  is_featured: boolean;
  status: 'completed' | 'in_progress' | 'planned';
}

// Testimonial Types
export interface Testimonial {
  id: number;
  client_name: string;
  client_position: string;
  client_company: string;
  client_image?: string;
  content: string;
  rating: number;
  project_title?: string;
  date: string;
  is_featured: boolean;
}

// News/Blog Types
export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  author_image?: string;
  featured_image: string;
  category: string;
  tags: string[];
  published_date: string;
  read_time_minutes: number;
  is_featured: boolean;
  slug: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
  lastUpdated: string | null;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  sort_by?: 'date' | 'title' | 'popularity' | 'price';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// Analytics Types
export interface PageAnalytics {
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
  top_referrers: string[];
  popular_content: string[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTimeout: number;
}

// Export utility types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
export type SortOrder = 'asc' | 'desc';
export type DateRange = {
  start: string;
  end: string;
};

// Generic utility types for API responses
export type ApiListResponse<T> = PaginatedResponse<T>;
export type ApiDetailResponse<T> = ApiResponse<T>;
export type ApiCreateResponse<T> = ApiResponse<T>;
export type ApiUpdateResponse<T> = ApiResponse<T>;
export type ApiDeleteResponse = ApiResponse<{ deleted: boolean }>;