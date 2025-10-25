import * as productRepository from '../repositories/productRepository.js';
import productImageRepository from '../repositories/productImageRepository.js';
import * as categoryService from './categoryService.js';
import logger from '../utils/logger.js';
import { sequelize } from '../config/database.js';

// Get all products (with optional images, pagination and category)
export const getAllProducts = async ({ includeImages = false, page = 1, limit = 20 } = {}) => {
  // productRepository.findAll returns a paginated object { items, total, page, limit, totalPages }
  const paged = await productRepository.findAll({ page, limit, includeCategory: true });

  // Attach images only if requested
  if (includeImages) {
    for (const product of paged.items) {
      product.images = await productImageRepository.findByProductId(product.id);
    }
  }

  return paged;
};

// Get product by ID (includes category and images)
export const getProductById = async (id) => {
  const product = await productRepository.findById(id, { includeCategory: true, includeImages: true });
  return product;
};

// Create product with multiple images
export const createProductWithImages = async (productData, imagesData) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate category if categoryId is provided
    if (productData.categoryId) {
      const category = await categoryService.getCategoryById(productData.categoryId);
      if (!category || !category.active) {
        const err = new Error('Categoría no encontrada o inactiva');
        err.statusCode = 400;
        throw err;
      }
    }

    // Create the product within the transaction
    const product = await productRepository.create(productData, { transaction });

    // Create all images inside the same transaction
    for (const imageData of imagesData) {
      await productImageRepository.create(product.id, imageData, transaction);
    }

    await transaction.commit();

    logger.info(`Producto creado: ${product.name} (${product.batchNumber}) con ${imagesData.length} imágenes`);

    // Reload product with category and images
    return await productRepository.findById(product.id, { includeCategory: true, includeImages: true });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Update product and manage its images
export const updateProduct = async (id, { productData, imagesData = [], imagesToDelete = [], mainImageId } = {}) => {
  // Validate category if needed
  if (productData && productData.categoryId) {
    const category = await categoryService.getCategoryById(productData.categoryId);
    if (!category || !category.active) {
      const err = new Error('Categoría no encontrada o inactiva');
      err.statusCode = 400;
      throw err;
    }
  }

  const product = await productRepository.update(id, productData);
  if (!product) {
    return null;
  }

  // Add new images
  for (const imageData of imagesData) {
    await productImageRepository.create(product.id, imageData);
  }

  // Delete selected images
  for (const imageId of imagesToDelete) {
    await productImageRepository.delete(imageId, product.id);
  }

  // Set main image if provided
  if (mainImageId) {
    await productImageRepository.setMainImage(mainImageId, product.id);
  }

  logger.info(`Producto actualizado: ${product.name} (ID: ${id})`);

  // Return updated product with category and images
  return await productRepository.findById(id, { includeCategory: true, includeImages: true });
};

// Soft delete a product
export const deleteProduct = async (id) => {
  const product = await productRepository.remove(id);
  if (product) {
    logger.info(`Producto eliminado: ${product.name}`);
  }
  return product;
};

// Add a single image to a product
export const addProductImage = async (productId, imageData) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  const image = await productImageRepository.create(productId, imageData);
  logger.info(`Imagen añadida al producto ${product.name}: ${imageData.filename}`);
  return image;
};

// Set main image for a product
export const setMainImage = async (productId, imageId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  await productImageRepository.setMainImage(imageId, productId);
  logger.info(`Imagen principal actualizada para el producto ${product.name}`);
  return await productImageRepository.findByProductId(productId);
};

// Delete a specific image from a product
export const deleteProductImage = async (productId, imageId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  await productImageRepository.delete(imageId, productId);
  logger.info(`Imagen eliminada del producto ${product.name}`);
  return true;
};

// Get all images for a product
export const getProductImages = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  return await productImageRepository.findByProductId(productId);
};
