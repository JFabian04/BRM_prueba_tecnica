import * as categoryRepository from '../repositories/categoryRepository.js';
import logger from '../utils/logger.js';

export const getAllCategories = async () => {
  return await categoryRepository.findAll();
};

export const getCategoryById = async (id) => {
  return await categoryRepository.findById(id);
};

export const createCategory = async (categoryData) => {
  const category = await categoryRepository.create(categoryData);
  logger.info(`Categoría creada: ${category.name}`);
  return category;
};

export const updateCategory = async (id, categoryData) => {
  const updated = await categoryRepository.update(id, categoryData);
  if (updated) logger.info(`Categoría actualizada: ${updated.name}`);
  return updated;
};

export const deleteCategory = async (id) => {
  const deleted = await categoryRepository.remove(id);
  if (deleted) logger.info(`Categoría eliminada: ${deleted.name}`);
  return deleted;
};
