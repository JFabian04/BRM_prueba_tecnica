import { User } from '../models/index.js';

export const create = async (userData) => {
  return await User.create(userData);
};

export const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};
