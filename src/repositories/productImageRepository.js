import ProductImage from '../models/ProductImage.js';
import { sequelize } from '../config/database.js';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';

class ProductImageRepository {
    // Create a new product image and handle main image logic within a transaction
    async create(productId, imageData) {
        const transaction = await sequelize.transaction();
        
        try {
            if (imageData.isMainImage) {
                // If the new image is set as main, unset main flag for others
                await ProductImage.update(
                    { isMainImage: false },
                    { 
                        where: { productId },
                        transaction
                    }
                );
            }

            const productImage = await ProductImage.create({
                productId,
                filename: imageData.filename,
                originalName: imageData.originalName,
                mimetype: imageData.mimetype,
                size: imageData.size,
                isMainImage: imageData.isMainImage
            }, { transaction });

            await transaction.commit();
            return productImage;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Get all images for a given product, ordered by main and creation date
    async findByProductId(productId) {
        return await ProductImage.findAll({
            where: { productId },
            order: [
                Sequelize.literal('is_main_image DESC'),
                Sequelize.literal('created_at DESC')
            ]
        });
    }

    // Get the main image for a specific product
    async getMainImage(productId) {
        return await ProductImage.findOne({
            where: { 
                productId,
                isMainImage: true
            }
        });
    }

    // Set a specific image as main for a given product
    async setMainImage(imageId, productId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Remove main flag from all images of the product
            await ProductImage.update(
                { isMainImage: false },
                { 
                    where: { productId },
                    transaction
                }
            );

            // Set the selected image as main
            await ProductImage.update(
                { isMainImage: true },
                { 
                    where: { id: imageId },
                    transaction
                }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Delete an image (DB record + physical file) and update main image if needed
    async delete(imageId, productId) {
        console.log(`Attempting to delete image with ID: ${imageId} for product ID: ${productId}`);
        const image = await ProductImage.findOne({
            where: { 
                id: imageId,
                productId
            }
        });

        console.log('Found image to delete:', image ? image.toJSON() : null);

        if (!image) {
            console.warn(`Image with ID ${imageId} not found for product ${productId}. Skipping.`);
            return false;
        }

        const filename = image.filename;
        const wasMain = image.isMainImage;
        await image.destroy();

        // Delete the physical file
        const filePath = path.join('uploads', filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting physical file: ${filePath}`, err);
            }
        });

        // If deleted image was main, set another one as main
        if (wasMain) {
            const nextImage = await ProductImage.findOne({
                where: { productId }
            });

            if (nextImage) {
                await this.setMainImage(nextImage.id, productId);
            }
        }

        return true;
    }
}

export default new ProductImageRepository();
