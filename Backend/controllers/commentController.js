// server/controllers/commentController.js
import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';

/**
 * Create a comment or reply
 * - If parentId is provided → creates a reply
 * - If no parentId → creates a top-level comment
 */
export const createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.user.id;

    // Verify the blog post exists
    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // If replying, verify parent comment exists and belongs to same post
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }
      
      // Prevent replying to a reply (only 1-level nesting)
      if (parentComment.parent) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reply to a reply. Only 1-level nesting is allowed.',
        });
      }
      
      // Ensure parent comment belongs to the same post
      if (parentComment.post.toString() !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this post',
        });
      }
    }

    // Create the comment/reply
    const comment = await Comment.create({
      content,
      user: userId,
      post: postId,
      parent: parentId || null,
    });

    // Update blog's comment count
    await Blog.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // Populate user info for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: parentId ? 'Reply added successfully' : 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};

/**
 * Get all comments for a specific post
 * - Returns top-level comments with their replies nested inside
 */
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify the blog post exists
    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // Get all comments for this post
    const comments = await Comment.find({ post: postId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Separate top-level comments and replies
    const topLevelComments = [];
    const repliesMap = new Map(); // parentId -> array of replies

    for (const comment of comments) {
      if (!comment.parent) {
        // This is a top-level comment
        topLevelComments.push(comment);
      } else {
        // This is a reply - group by parent
        const parentId = comment.parent.toString();
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId).push(comment);
      }
    }

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map(comment => {
      const commentObj = comment.toObject();
      const replies = repliesMap.get(comment._id.toString()) || [];
      // Sort replies by creation date (oldest first)
      commentObj.replies = replies.sort((a, b) => a.createdAt - b.createdAt);
      return commentObj;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedComments = commentsWithReplies.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: commentsWithReplies.length,
        pages: Math.ceil(commentsWithReplies.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

/**
 * Delete a comment (and its replies if it's a top-level comment)
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization (only comment owner or admin can delete)
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    // If it's a top-level comment, delete all its replies as well
    let deletedCount = 1;
    if (!comment.parent) {
      const replyResult = await Comment.deleteMany({ parent: id });
      deletedCount += replyResult.deletedCount;
    }

    await comment.deleteOne();

    // Update blog's comment count
    await Blog.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -deletedCount }
    });

    res.status(200).json({
      success: true,
      message: `Comment${deletedCount > 1 ? 's' : ''} deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message,
    });
  }
};

/**
 * Update a comment
 */
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment',
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(id).populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message,
    });
  }
};