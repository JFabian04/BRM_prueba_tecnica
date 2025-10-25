import * as categoryRepository from '../repositories/categoryRepository.js';
import logger from '../utils/logger.js';

// Retrieve all active categories
export const getAllCategories = async () => {
  return await categoryRepository.findAll();
};

// Retrieve a single category by its ID
export const getCategoryById = async (id) => {
  return await categoryRepository.findById(id);
};

// Create a new category and log the action
export const createCategory = async (categoryData) => {
  const category = await categoryRepository.create(categoryData);
  logger.info(`Category created: ${category.name}`);
  return category;
};

// Update an existing category by ID and log the action
export const updateCategory = async (id, categoryData) => {
  const updated = await categoryRepository.update(id, categoryData);
  if (updated) logger.info(`Category updated: ${updated.name}`);
  return updated;
};

// Soft delete a category by ID and log the action
export const deleteCategory = async (id) => {
  const deleted = await categoryRepository.remove(id);
  if (deleted) logger.info(`Category deleted: ${deleted.name}`);
  return deleted;
};
