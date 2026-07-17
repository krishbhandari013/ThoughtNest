// server/controllers/blogController.js
import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  if (!file) return '';
  
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'thoughtnest/blog-covers',
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    console.log('📝 Create blog request received');
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    const { title, content, excerpt, category, tags, status } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }
    
    // Upload cover image if provided
    let coverImage = '';
    if (req.file) {
      try {
        coverImage = await uploadToCloudinary(req.file);
        console.log('✅ Cover image uploaded:', coverImage);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload cover image. Please try again.',
        });
      }
    }
    
    // Generate excerpt from content if not provided
    let finalExcerpt = excerpt;
    if (!finalExcerpt && content) {
      const plainText = content.replace(/<[^>]*>/g, '');
      finalExcerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    // Create blog post
    const blog = await Blog.create({
      title: title.trim(),
      content,
      coverImage,
      excerpt: finalExcerpt,
      category: category || '',
      tags: tags || [],
      status: status || 'draft',
      author: userId,
      authorName: req.user?.name || 'Anonymous',
      publishedAt: status === 'published' ? new Date() : null,
    });
    
    console.log('✅ Blog created successfully:', blog._id);
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
    
  } catch (error) {
    console.error('❌ Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all blogs (with filtering)
export const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status,
      author,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      exclude
    } = req.query;

    const query = {};
    
    // Only show published posts for public access
    if (!req.user) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }
    
    if (category) query.category = category;
    if (author) query.author = author;
    if (exclude) query._id = { $ne: exclude };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name email avatar'),
      Blog.countDocuments(query),
    ]);
    
    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id)
      .populate('author', 'name email avatar');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message,
    });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { title, content, excerpt, category, tags, status } = req.body;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    // Check if user is author or admin
    if (blog.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }
    
    // Update fields
    if (title) blog.title = title.trim();
    if (content) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category !== undefined) blog.category = category;
    if (tags) blog.tags = tags;
    
    // If status changing to published, set publishedAt
    if (status === 'published' && blog.status !== 'published') {
      blog.publishedAt = new Date();
    }
    if (status) blog.status = status;
    
    blog.updatedAt = Date.now();
    await blog.save();
    
    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message,
    });
  }
};

// Delete blog post
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    // Check if user is author or admin
    if (blog.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }
    
    // Delete cover image from Cloudinary if exists
    if (blog.coverImage) {
      await deleteFromCloudinary(blog.coverImage);
    }
    
    await blog.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message,
    });
  }
};

// Like/Unlike blog post
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    const likeIndex = blog.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(likeIndex, 1);
    }
    
    blog.likesCount = blog.likes.length;
    await blog.save();
    
    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Blog liked' : 'Blog unliked',
      data: { likesCount: blog.likesCount },
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message,
    });
  }
};

// Get blogs by author
export const getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, total] = await Promise.all([
      Blog.find({ author: authorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name email avatar'),
      Blog.countDocuments({ author: authorId }),
    ]);
    
    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get blogs by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch author blogs',
      error: error.message,
    });
  }
};