import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

interface ValidationRule {
  field: string;
  validate: (value: any) => string | null;
  required?: boolean;
}

interface UseFormValidationProps<T> {
  formData: T;
  validationRules: ValidationRule[];
  realTimeValidation?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>({
  formData,
  validationRules,
  realTimeValidation = true
}: UseFormValidationProps<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) return null;

    // Check required fields
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Run custom validation
    return rule.validate(value);
  }, [validationRules]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    validationRules.forEach(rule => {
      const error = validateField(rule.field, formData[rule.field]);
      if (error) {
        newErrors[rule.field] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(valid);
    return valid;
  }, [formData, validateField, validationRules]);

  // Real-time validation when formData changes
  useEffect(() => {
    if (realTimeValidation) {
      validateAll();
    }
  }, [formData, realTimeValidation, validateAll]);

  // Mark field as touched
  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Get error for a specific field (only if touched)
  const getFieldError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined;
  }, [errors, touched]);

  // Clear errors for a field
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    touchField,
    getFieldError,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};

// Common validation rules
export const validationRules = {
  required: (field: string) => ({
    field,
    required: true,
    validate: () => null
  }),
  
  email: (field: string) => ({
    field,
    required: true,
    validate: (value: string) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    }
  }),
  
  phone: (field: string) => ({
    field,
    required: true,
    validate: (value: string) => {
      if (!value) return null;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      return phoneRegex.test(cleanPhone) ? null : 'Please enter a valid phone number';
    }
  }),
  
  date: (field: string) => ({
    field,
    required: true,
    validate: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today ? null : 'Date must be today or in the future';
    }
  }),
  
  minLength: (field: string, min: number) => ({
    field,
    validate: (value: string) => {
      if (!value) return null;
      return value.length >= min ? null : `${field} must be at least ${min} characters`;
    }
  }),
  
  minValue: (field: string, min: number) => ({
    field,
    validate: (value: number) => {
      if (value == null) return null;
      return value >= min ? null : `${field} must be at least ${min}`;
    }
  })
};