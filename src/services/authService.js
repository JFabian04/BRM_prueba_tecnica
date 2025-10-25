import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const user = await userRepository.create({
    name,
    email,
    password,
    role: role || config.roles.CLIENT
  });

  const token = generateToken(user.id);

  logger.info(`Usuario registrado: ${user.email}`);

  return { user, token };
};

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

  logger.info(`Login exitoso: ${user.email}`);

  return { user, token };
};