// server/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

// Configure storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Avatar upload (max 2MB)
export const uploadAvatar = upload.single('avatar');

// Cover image upload (max 5MB)
export const uploadCover = upload.single('cover');

// Generic image upload
export const uploadImage = upload.single('image');