// server/routes/commentRoutes.js
import express from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment,
  updateComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/userMiddleware.js';
import {
  validate,
  createCommentSchema,
  replyToCommentSchema,
} from '../validators/commentValidator.js';

const  commentRoutes = express.Router();

// Protected routes (require authentication)
 commentRoutes.post(
  '/',
  protect,
  validate(createCommentSchema),
  createComment
);

 commentRoutes.post(
  '/reply',
  protect,
  validate(replyToCommentSchema),
  createComment
);

commentRoutes.delete('/:id', protect, deleteComment);
commentRoutes.put('/:id', protect, updateComment);

// Public routes
commentRoutes.get('/:postId', getCommentsByPost);

export default commentRoutes;