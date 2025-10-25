import { User } from '../models/index.js';

// Create a new user with provided data
export const create = async (userData) => {
  return await User.create(userData);
};

// Find a user by their email address
export const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};
