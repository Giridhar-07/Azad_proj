export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

import { Security } from './security';

export class Validator {
  public static validateTaskTitle(title: string): ValidationResult {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('Task title is required');
    }
    
    if (title.length > 100) {
      errors.push('Task title must be less than 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a required field
   * @param value - The field value
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  public static validateRequired(value: string, fieldName: string = 'Field'): ValidationResult {
    const errors: string[] = [];
    
    if (!value || value.trim() === '') {
      errors.push(`${fieldName} is required`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates minimum length
   * @param value - The field value
   * @param minLength - Minimum required length
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  public static validateMinLength(value: string, minLength: number, fieldName: string = 'Field'): ValidationResult {
    const errors: string[] = [];
    
    if (value && value.trim().length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates maximum length
   * @param value - The field value
   * @param maxLength - Maximum allowed length
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  public static validateMaxLength(value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult {
    const errors: string[] = [];
    
    if (value && value.trim().length > maxLength) {
      errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates email format
   * @param value - The email to validate
   * @returns Validation result
   */
  public static validateEmail(value: string): ValidationResult {
    const errors: string[] = [];
    
    if (value && !Security.validateEmail(value)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates alphanumeric input with common punctuation
   * @param value - The value to validate
   * @param fieldName - Name of the field for error message
   * @returns Validation result
   */
  public static validateAlphanumeric(value: string, fieldName: string = 'Field'): ValidationResult {
    const errors: string[] = [];
    
    if (value && !Security.isAlphanumeric(value)) {
      errors.push(`${fieldName} can only contain letters, numbers, and common punctuation`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a file upload
   * @param file - The file to validate
   * @param options - Validation options
   * @returns Validation result
   */
  public static validateFile(
    file: File | null,
    options: {
      required?: boolean;
      allowedTypes?: string[];
      maxSizeMB?: number;
      fieldName?: string;
    } = {}
  ): ValidationResult {
    const { required = false, allowedTypes, maxSizeMB, fieldName = 'File' } = options;
    const errors: string[] = [];
    
    if (!file) {
      if (required) {
        errors.push(`Please select a ${fieldName.toLowerCase()}`);
      }
      return {
        isValid: !required,
        errors
      };
    }
    
    if (file) {
      const result = Security.validateFile(file, allowedTypes, maxSizeMB);
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Combines multiple validation results
   * @param results - Array of validation results
   * @returns Combined validation result
   */
  public static combineResults(...results: ValidationResult[]): ValidationResult {
    const combinedErrors: string[] = [];
    
    for (const result of results) {
      combinedErrors.push(...result.errors);
    }
    
    return {
      isValid: combinedErrors.length === 0,
      errors: combinedErrors
    };
  }
}