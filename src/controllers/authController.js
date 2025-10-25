import * as authService from '../services/authService.js';

/**
 * Register a new user and return a token.
 */
export const register = async (req, res, next) => {
  try {
    // Call service to register the user
    const { user, token } = await authService.registerUser(req.body);

    // Return success response with user data and token
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(), // Convert Sequelize instance to plain object
        token
      }
    });
  } catch (error) {
    // Pass error to Express error handler
    next(error);
  }
};

/**
 * Log in a user and return a token if credentials are valid.
 */
export const login = async (req, res, next) => {
  try {
    // Call service to validate credentials
    const result = await authService.loginUser(req.body);

    // If login failed, return 401
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const { user, token } = result;

    // Return success response with token
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the authenticated user's profile.
 */
export const getProfile = async (req, res, next) => {
  try {
    // Return current authenticated user info
    res.json({
      success: true,
      data: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
