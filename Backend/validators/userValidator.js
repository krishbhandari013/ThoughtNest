// validators/userValidator.js
import { z } from 'zod';

// Validation Schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .trim()
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .trim()
});

// ✅ CORRECT Validation Middleware
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    // Use flatten() for simpler structure
    const flattened = result.error.flatten();
    
    // Convert to array of errors
    const errors = [];
    
    // Add field errors
    if (flattened.fieldErrors) {
      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        messages.forEach(message => {
          errors.push({ field, message });
        });
      });
    }
    
    // Add form errors (if any)
    if (flattened.formErrors && flattened.formErrors.length > 0) {
      flattened.formErrors.forEach(message => {
        errors.push({ field: 'form', message });
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  req.body = result.data;
  next();
};