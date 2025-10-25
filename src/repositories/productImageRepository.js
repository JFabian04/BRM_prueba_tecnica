import ProductImage from '../models/ProductImage.js';
import { sequelize } from '../config/database.js';
import { Sequelize } from 'sequelize';

class ProductImageRepository {
    async create(productId, imageData) {
        const transaction = await sequelize.transaction();
        
        try {
            if (imageData.isMainImage) {
                // Si la nueva imagen será principal, actualizar las demás a no principales
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

    async findByProductId(productId) {
        // Order explicitly by DB column names to avoid Sequelize mapping issues
        // (the model maps `isMainImage` -> `is_main_image` and `createdAt` -> `created_at`).
        // Use raw column names (without forcing a table prefix) via literals so
        // the ORDER BY matches the actual columns present in the query regardless
        // of the table alias Sequelize uses at runtime.
        return await ProductImage.findAll({
            where: { productId },
            order: [
                Sequelize.literal('is_main_image DESC'),
                Sequelize.literal('created_at DESC')
            ]
        });
    }

    async getMainImage(productId) {
        return await ProductImage.findOne({
            where: { 
                productId,
                isMainImage: true
            }
        });
    }

    async setMainImage(imageId, productId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Primero quitar el flag de principal de todas las imágenes del producto
            await ProductImage.update(
                { isMainImage: false },
                { 
                    where: { productId },
                    transaction
                }
            );

            // Establecer la nueva imagen principal
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

    async delete(imageId, productId) {
        const image = await ProductImage.findOne({
            where: { 
                id: imageId,
                productId
            }
        });

        if (!image) {
            throw new Error('Image not found');
        }

        const wasMain = image.isMainImage;
        await image.destroy();

        if (wasMain) {
            // Si era la imagen principal, establecer otra imagen como principal
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