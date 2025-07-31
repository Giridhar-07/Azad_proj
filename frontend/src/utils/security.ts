import DOMPurify from 'dompurify';
import xss from 'xss';
import CryptoJS from 'crypto-js';

/**
 * Security utilities for the frontend application
 * Provides functions for input validation, sanitization, and protection against common web vulnerabilities
 */
export class Security {
  /**
   * Sanitizes user input to prevent XSS attacks
   * @param input - The user input to sanitize
   * @returns Sanitized string safe for rendering
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    return DOMPurify.sanitize(xss(input));
  }

  /**
   * Encrypts data using AES encryption
   * @param data - The data to encrypt
   * @param key - The encryption key
   * @returns Encrypted string
   */
  static encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Decrypts AES encrypted data
   * @param encryptedData - The encrypted data
   * @param key - The decryption key
   * @returns Decrypted string
   */
  static decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Validates email format
   * @param email - The email to validate
   * @returns Boolean indicating if email is valid
   */
  static validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generates a CSRF token for form submissions
   * @returns Random token string
   */
  static generateCSRFToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Validates that a string contains only alphanumeric characters and common punctuation
   * @param input - The string to validate
   * @returns Boolean indicating if string is valid
   */
  static isAlphanumeric(input: string): boolean {
    if (!input) return false;
    
    const alphanumericRegex = /^[a-zA-Z0-9\s.,!?()-]+$/;
    return alphanumericRegex.test(input);
  }

  /**
   * Generates a nonce for Content Security Policy
   * @returns Random nonce string
   */
  static generateNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    
    for (let i = 0; i < 16; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return nonce;
  }

  /**
   * Validates file type and size before upload
   * @param file - The file to validate
   * @param allowedTypes - Array of allowed MIME types
   * @param maxSizeMB - Maximum file size in MB
   * @returns Object with validation result and error message if any
   */
  static validateFile(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
    maxSizeMB: number = 5
  ): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `File size exceeds ${maxSizeMB}MB limit` 
      };
    }
    
    return { valid: true };
  }

  /**
   * Creates a Content Security Policy header value
   * @returns CSP header value string
   */
  static getCSPPolicy(): string {
    const nonce = this.generateNonce();
    
    return `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net;
      style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
      img-src 'self' data: https://*;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.openai.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
  }
}