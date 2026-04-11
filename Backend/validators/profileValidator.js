// server/validators/profileValidator.js
import { z } from 'zod';

// Social links schema
const socialLinksSchema = z.object({
  twitter: z.string().max(100, 'Twitter handle too long').optional().default(''),
  github: z.string().max(100, 'GitHub username too long').optional().default(''),
  linkedin: z.string().max(100, 'LinkedIn URL too long').optional().default(''),
}).optional();

// Update profile validation schema
export const updateProfileSchema = z.object({
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  
  website: z.string()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  
  socialLinks: socialLinksSchema,
}).strict();

// Avatar upload validation
export const avatarUploadSchema = z.object({
  avatar: z.any().optional(),
}).strict();

// Cover upload validation
export const coverUploadSchema = z.object({
  cover: z.any().optional(),
}).strict();

// Get profile validation
export const getProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Validation middleware
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    const zodIssues = result.error?.issues || result.error?.errors || [];
    const errors = zodIssues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  
  req.body = result.data;
  next();
};