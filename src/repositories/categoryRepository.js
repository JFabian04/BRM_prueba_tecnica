import { Category } from '../models/index.js';
import { Sequelize } from 'sequelize';

export const findAll = async () => {
  return await Category.findAll({ where: { active: true }, order: [Sequelize.literal('created_at DESC')] });
};

export const findById = async (id) => {
  return await Category.findByPk(id);
};

export const create = async (categoryData) => {
  return await Category.create(categoryData);
};

export const update = async (id, categoryData) => {
  const category = await Category.findByPk(id);
  if (category) {
    return await category.update(categoryData);
  }
  return null;
};

export const remove = async (id) => {
  const category = await Category.findByPk(id);
  if (category) {
    return await category.update({ active: false });
  }
  return null;
};
