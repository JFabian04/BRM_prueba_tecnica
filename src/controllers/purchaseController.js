import * as purchaseService from '../services/purchaseService.js';

/**
 * Create a new purchase for the authenticated user.
 */
export const createPurchase = async (req, res, next) => {
  try {
    const { products } = req.body; // products to be purchased
    const userId = req.user.id; // current authenticated user ID

    // Validate that at least one product is included
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto'
      });
    }

    // Create the purchase using the service
    const purchase = await purchaseService.createPurchase(userId, products);

    res.status(201).json({
      success: true,
      message: 'Compra realizada exitosamente',
      data: purchase
    });
  } catch (error) {
    // Handle known validation or stock errors
    if (error.message.includes('no encontrado') || error.message.includes('insuficiente')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
  }
};

/**
 * Get all purchases made by the authenticated user.
 */
export const getMyPurchases = async (req, res, next) => {
  try {
    const purchases = await purchaseService.getMyPurchases(req.user.id);
    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific purchase by ID (only if it belongs to the user).
 */
export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id, req.user.id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
    }
    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all purchases in the system (admin only).
 */
export const getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await purchaseService.getAllPurchases();
    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    next(error);
  }
};
