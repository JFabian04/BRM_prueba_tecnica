import sequelize from '../config/database.js';
import * as purchaseRepository from '../repositories/purchaseRepository.js';
import * as productRepository from '../repositories/productRepository.js';
import logger from '../utils/logger.js';

// Create a new purchase
export const createPurchase = async (userId, products) => {
    const transaction = await sequelize.transaction();
    try {
        let totalAmount = 0;
        const purchaseDetails = [];

        for (const item of products) {
            const product = await productRepository.findById(item.productId);

            if (!product || !product.active) {
                throw new Error(`Producto ${item.productId} no encontrado`);
            }

            if (!product.hasStock(item.quantity)) {
                throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.availableQuantity}`);
            }

            const subtotal = product.price * item.quantity;
            totalAmount += parseFloat(subtotal);

            purchaseDetails.push({
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal
            });

            await product.reduceStock(item.quantity);
        }

        const purchaseData = {
            userId,
            totalAmount,
            status: 'completed'
        };

        const purchase = await purchaseRepository.create(purchaseData, purchaseDetails, transaction);
        await transaction.commit();

        logger.info(`Compra realizada: ID ${purchase.id} - Usuario ${userId}`);
        return await purchaseRepository.findById(purchase.id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Get all purchases by user
export const getMyPurchases = async (userId) => {
    return await purchaseRepository.findAllByUserId(userId);
};

// Get purchase by ID
export const getPurchaseById = async (id, userId) => {
    return await purchaseRepository.findById(id, userId);
};

// Get all purchases (admin)
export const getAllPurchases = async () => {
    return await purchaseRepository.findAll();
};
