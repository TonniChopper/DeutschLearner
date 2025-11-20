import { useState, useCallback } from 'react';

/**
 * Form validation utilities and hooks
 */

// Validation rules
export const validators = {
  required: value => (value && value.trim() !== '' ? null : 'This field is required'),

  email: value => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  minLength: min => value =>
    value && value.length >= min ? null : `Must be at least ${min} characters`,

  maxLength: max => value =>
    value && value.length <= max ? null : `Must be at most ${max} characters`,

  username: value => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be at most 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return 'Username can only contain letters, numbers, and underscores';
    return null;
  },

  password: value => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return null;
  },

  confirmPassword: (value, formData) =>
    value === formData.password ? null : 'Passwords do not match',

  name: value => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters';
    return null;
  },
};

/**
 * Custom hook for form validation
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate single field
  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) return null;

      for (const rule of Array.isArray(rules) ? rules : [rules]) {
        const error = typeof rule === 'function' ? rule(value, values) : null;
        if (error) return error;
      }
      return null;
    },
    [validationRules, values]
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    e => {
      const { name, value } = e.target;
      setValues(prev => ({ ...prev, [name]: value }));

      // Validate on change if field was touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    e => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setErrors,
  };
};
