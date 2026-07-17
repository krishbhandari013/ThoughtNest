// server/routes/blogRoutes.js
import express from 'express';
import multer from 'multer';
import { 
  createBlog, 
  getBlogs, 
  getBlogById, 
  updateBlog, 
  deleteBlog,
  toggleLike,
  getBlogsByAuthor
} from '../controllers/blogController.js';
import { protect } from '../middleware/userMiddleware.js';
import { uploadCoverImage } from '../middleware/uploadMiddleware.js';
import { validate, createBlogSchema, updateBlogSchema } from '../validators/blogValidator.js';

const blogRouter = express.Router();

// Normalize payload for multipart form data
const normalizeBlogPayload = (req, _res, next) => {
  // Multer + multipart forms send complex fields as strings.
  if (typeof req.body.tags === 'string') {
    try {
      const parsedTags = JSON.parse(req.body.tags);
      req.body.tags = Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
      req.body.tags = [];
    }
  }

  if (typeof req.body.excerpt === 'string' && req.body.excerpt.trim() === '') {
    req.body.excerpt = undefined;
  }

  if (typeof req.body.category === 'string') {
    req.body.category = req.body.category.trim();
  }

  next();
};

const handleCoverImageUpload = (req, res, next) => {
  uploadCoverImage(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Cover image must be 5MB or smaller.',
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid image file.',
    });
  });
};

// Public routes
blogRouter.get('/', getBlogs);
blogRouter.get('/:id', getBlogById);
blogRouter.get('/author/:authorId', getBlogsByAuthor);

// Protected routes (require authentication)
blogRouter.post(
  '/create',
  protect,
  handleCoverImageUpload,
  normalizeBlogPayload,
  validate(createBlogSchema),
  createBlog
);

// Update blog route
blogRouter.put(
  '/:id',
  protect,
  normalizeBlogPayload,
  validate(updateBlogSchema),
  updateBlog
);

// Delete blog route
blogRouter.delete('/:id', protect, deleteBlog);

// Like/Unlike blog route
blogRouter.post('/:id/like', protect, toggleLike);

export default blogRouter;