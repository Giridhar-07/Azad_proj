export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

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
}