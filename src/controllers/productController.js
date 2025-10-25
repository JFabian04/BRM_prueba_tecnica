import * as productService from '../services/productService.js';
import fs from 'fs';

/**
 * Get all products with optional pagination and image inclusion.
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const includeImages = req.query.includeImages === 'true'; // whether to include images in response
    const page = req.query.page ? parseInt(req.query.page) : 1; // current page
    const limit = req.query.limit ? parseInt(req.query.limit) : 20; // number of items per page

    const paged = await productService.getAllProducts({ includeImages, page, limit });

    res.json({
      success: true,
      data: paged.items,
      meta: {
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        totalPages: paged.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a product by its ID, including full image URLs.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Build full URL for each image
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        image.setDataValue('url', `${req.protocol}://${req.get('host')}/uploads/${image.filename}`);
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product with images.
 */
export const createProduct = async (req, res, next) => {
  try {
    console.log('DATA: ', req.body)
    const productData = {
      batchNumber: req.body.batchNumber,
      name: req.body.name,
      price: parseFloat(req.body.price),
      availableQuantity: parseInt(req.body.availableQuantity),
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
      entryDate: req.body.entryDate
    };

    const files = req.files; // uploaded image files
    const imagesMetadataRaw = req.body.imagesMetadata;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos una imagen para el producto'
      });
    }

    // Determine which image is the main one (by metadata or index)
    let imagesData = [];
    if (imagesMetadataRaw) {
      let imagesMetadata = [];
      try {
        imagesMetadata = JSON.parse(imagesMetadataRaw);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'imagesMetadata debe ser JSON válido' });
      }

      if (!Array.isArray(imagesMetadata) || imagesMetadata.length !== files.length) {
        return res.status(400).json({ success: false, message: 'imagesMetadata debe ser un array con la misma longitud que files' });
      }

      // Combine uploaded files and metadata
      imagesData = files.map((file, idx) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        isMainImage: !!imagesMetadata[idx].isMainImage
      }));
    } else {
      const mainImageIndex = parseInt(req.body.mainImageIndex || '0');
      if (isNaN(mainImageIndex) || mainImageIndex < 0 || mainImageIndex >= files.length) {
        return res.status(400).json({ success: false, message: 'Índice de imagen principal inválido' });
      }

      // Mark main image based on index
      imagesData = files.map((file, idx) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        isMainImage: idx === mainImageIndex
      }));
    }

    // Create product with image records
    const product = await productService.createProductWithImages(productData, imagesData);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente con imágenes',
      data: product
    });
  } catch (error) {
    // Delete uploaded files in case of failure
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error eliminando archivo:', err);
        });
      });
    }
    next(error);
  }
};

/**
 * Update an existing product, including new or deleted images.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const productData = {
      batchNumber: req.body.batchNumber,
      name: req.body.name,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      availableQuantity: req.body.availableQuantity ? parseInt(req.body.availableQuantity) : undefined,
      entryDate: req.body.entryDate,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined
    };

    // Remove undefined fields before updating
    Object.keys(productData).forEach(key => 
      productData[key] === undefined && delete productData[key]
    );

    console.log('req.files:', req.files);
    console.log('req.body.deleteImages:', req.body.deleteImages);

    // Handle new uploaded images
    let imagesData = [];
    if (req.files && req.files.length > 0) {
      const imagesMetadataRaw = req.body.imagesMetadata;
      if (imagesMetadataRaw) {
        let imagesMetadata = [];
        try {
          imagesMetadata = JSON.parse(imagesMetadataRaw);
        } catch (err) {
          return res.status(400).json({ success: false, message: 'imagesMetadata debe ser JSON válido' });
        }

        if (!Array.isArray(imagesMetadata) || imagesMetadata.length !== req.files.length) {
          return res.status(400).json({ success: false, message: 'imagesMetadata debe ser un array con la misma longitud que files' });
        }

        // Combine files and metadata
        imagesData = req.files.map((file, idx) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          isMainImage: !!imagesMetadata[idx].isMainImage
        }));
      } else {
        const mainImageIndex = parseInt(req.body.mainImageIndex || '0');
        if (isNaN(mainImageIndex) || mainImageIndex < 0 || mainImageIndex >= req.files.length) {
          return res.status(400).json({ success: false, message: 'Índice de imagen principal inválido' });
        }

        imagesData = req.files.map((file, idx) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          isMainImage: idx === mainImageIndex
        }));
      }
    }

    // Parse IDs of images to delete
    let imagesToDelete = [];
    if (req.body.deleteImages) {
      const raw = req.body.deleteImages;
      if (Array.isArray(raw)) {
        imagesToDelete = raw.map(Number).filter(id => !isNaN(id));
      } else if (typeof raw === 'string') {
        imagesToDelete = raw.split(',').map(Number).filter(id => !isNaN(id));
      }
    }

    // ID of existing image to set as main
    const mainImageId = req.body.mainImageId ? parseInt(req.body.mainImageId) : undefined;

    const product = await productService.updateProduct(req.params.id, {
      productData,
      imagesData,
      imagesToDelete,
      mainImageId
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product by ID.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
