import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Generate a JWT token for a given user ID
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Register a new user and return both the user and JWT token
export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const user = await userRepository.create({
    name,
    email,
    password,
    role: role || config.roles.CLIENT
  });

  const token = generateToken(user.id);

  logger.info(`User registered: ${user.email}`);

  return { user, token };
};

// Authenticate a user by email and password, returning a JWT token if valid
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await userRepository.findByEmail(email);

  if (!user || !user.active) {
    return null;
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return null;
  }

  const token = generateToken(user.id);

  logger.info(`Successful login: ${user.email}`);

  return { user, token };
};
