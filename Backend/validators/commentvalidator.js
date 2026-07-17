// server/validators/commentValidator.js
import { z } from 'zod';

// Schema for creating a new comment (top-level)
export const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  postId: z.string()
    .min(1, 'Post ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID format'),
});

// Schema for replying to a comment
export const replyToCommentSchema = z.object({
  content: z.string()
    .min(1, 'Reply cannot be empty')
    .max(2000, 'Reply cannot exceed 2000 characters'),
  postId: z.string()
    .min(1, 'Post ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID format'),
  parentId: z.string()
    .min(1, 'Parent comment ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent comment ID format'),
});

// Validation middleware
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