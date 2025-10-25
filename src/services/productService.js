import * as productRepository from '../repositories/productRepository.js';
import productImageRepository from '../repositories/productImageRepository.js';
import * as categoryService from './categoryService.js';
import logger from '../utils/logger.js';

export const getAllProducts = async ({ includeImages = false, page = 1, limit = 20 } = {}) => {
  // productRepository.findAll returns a paginated object { items, total, page, limit, totalPages }
  const paged = await productRepository.findAll({ page, limit, includeCategory: true });

  // Attach images only if requested; category already included by the repository
  if (includeImages) {
    for (const product of paged.items) {
      product.images = await productImageRepository.findByProductId(product.id);
    }
  }

  return paged;
};

export const getProductById = async (id) => {
  const product = await productRepository.findById(id, { includeCategory: true, includeImages: true });
  return product;
};

export const createProductWithImages = async (productData, imagesData) => {
  // Crear el producto primero
  // Si se asigna categoryId, validar que exista
  if (productData.categoryId) {
    const category = await categoryService.getCategoryById(productData.categoryId);
    if (!category || !category.active) {
      const err = new Error('Categoría no encontrada o inactiva');
      err.statusCode = 400;
      throw err;
    }
  }

  const product = await productRepository.create(productData);

  // Crear las imágenes (cada operación maneja su propia transacción)
  for (const imageData of imagesData) {
    await productImageRepository.create(product.id, imageData);
  }

  logger.info(`Producto creado: ${product.name} (${product.batchNumber}) con ${imagesData.length} imágenes`);

  // Recargar producto con imágenes
  return await productRepository.findById(product.id, { includeCategory: true, includeImages: true });
};

export const updateProduct = async (id, { productData, imagesData = [], imagesToDelete = [], mainImageId } = {}) => {
  // Actualizar datos básicos del producto
  // Validar categoryId si viene en la actualización
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

  // Agregar nuevas imágenes
  for (const imageData of imagesData) {
    await productImageRepository.create(product.id, imageData);
  }

  // Eliminar imágenes indicadas
  for (const imageId of imagesToDelete) {
    await productImageRepository.delete(imageId, product.id);
  }

  // Establecer imagen principal si se indica (imageId ya existente)
  if (mainImageId) {
    await productImageRepository.setMainImage(mainImageId, product.id);
  }

  logger.info(`Producto actualizado: ${product.name} (ID: ${id})`);

  // Devolver producto recargado con imágenes
  return await productRepository.findById(id, { includeCategory: true, includeImages: true });
};

export const deleteProduct = async (id) => {
  const product = await productRepository.remove(id);
  if (product) {
    logger.info(`Producto eliminado: ${product.name}`);
  }
  return product;
};

export const addProductImage = async (productId, imageData) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  const image = await productImageRepository.create(productId, imageData);
  logger.info(`Imagen añadida al producto ${product.name}: ${imageData.filename}`);
  return image;
};

export const setMainImage = async (productId, imageId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  await productImageRepository.setMainImage(imageId, productId);
  logger.info(`Imagen principal actualizada para el producto ${product.name}`);
  return await productImageRepository.findByProductId(productId);
};

export const deleteProductImage = async (productId, imageId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  await productImageRepository.delete(imageId, productId);
  logger.info(`Imagen eliminada del producto ${product.name}`);
  return true;
};

export const getProductImages = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Product not found');
  return await productImageRepository.findByProductId(productId);
};