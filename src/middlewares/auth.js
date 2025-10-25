import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/index.js';

/**
 * Middleware to authenticate user using JWT.
 * Verifies token, decodes it, and attaches user to the request.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Extract token and verify it
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user by ID from decoded token
    const user = await User.findByPk(decoded.id);

    // If user does not exist or is inactive, deny access
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Attach user object to the request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize users based on their roles.
 * Accepts one or more valid roles as parameters.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure the user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      });
    }

    next();
  };
};
