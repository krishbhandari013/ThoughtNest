// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // ✅ Make sure JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export default generateToken;