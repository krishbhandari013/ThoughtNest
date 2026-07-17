// server/validators/blogValidator.js
import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  
  content: z.string()
    .min(50, 'Content must be at least 50 characters'),
  
  excerpt: z.string()
    .max(220, 'Excerpt cannot exceed 220 characters')
    .optional(),
  
  category: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  
  status: z.enum(['draft', 'published']).default('draft'),
});

// ✅ Add update blog schema (all fields optional)
export const updateBlogSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .optional(),
  
  excerpt: z.string()
    .max(220, 'Excerpt cannot exceed 220 characters')
    .optional(),
  
  category: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  
  status: z.enum(['draft', 'published']).optional(),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
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