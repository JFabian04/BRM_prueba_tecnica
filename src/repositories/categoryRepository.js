import { Category } from '../models/index.js';
import { Sequelize } from 'sequelize';

// Fetch all active categories, ordered by creation date (descending)
export const findAll = async () => {
  return await Category.findAll({ where: { active: true }, order: [Sequelize.literal('created_at DESC')] });
};

// Find a category by its primary key (ID)
export const findById = async (id) => {
  return await Category.findByPk(id);
};

// Create a new category with provided data
export const create = async (categoryData) => {
  return await Category.create(categoryData);
};

// Update an existing category by ID with new data
export const update = async (id, categoryData) => {
  const category = await Category.findByPk(id);
  if (category) {
    return await category.update(categoryData);
  }
  return null;
};

// Soft delete a category by setting 'active' to false
export const remove = async (id) => {
  const category = await Category.findByPk(id);
  if (category) {
    return await category.update({ active: false });
  }
  return null;
};
