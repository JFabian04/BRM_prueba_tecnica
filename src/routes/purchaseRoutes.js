import { Router } from 'express';
import { body } from 'express-validator';
import { createPurchase, getMyPurchases, getPurchaseById, getAllPurchases } from '../controllers/purchaseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import config from '../config/config.js';

const router = Router();

/**
 * @api {post} /api/purchases Crear una nueva compra (Cliente)
 * @apiName CreatePurchase
 * @apiGroup Purchases
 * @apiHeader {String} Authorization Bearer token.
 * @apiBody {Object[]} products Lista de productos a comprar.
 * @apiBody {Number} products.productId ID del producto.
 * @apiBody {Number} products.quantity Cantidad del producto.
 */
router.post('/', [
  authenticate,
  authorize(config.roles.CLIENT),
  body('products').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('products.*.productId').isInt().withMessage('ID de producto inválido'),
  body('products.*.quantity').isInt({ gt: 0 }).withMessage('La cantidad debe ser mayor a 0'),
  validate
], createPurchase);

/**
 * @api {get} /api/purchases/my-purchases Obtener historial de compras (Cliente)
 * @apiName GetMyPurchases
 * @apiGroup Purchases
 * @apiHeader {String} Authorization Bearer token.
 */
router.get('/my-purchases', [
  authenticate,
  authorize(config.roles.CLIENT)
], getMyPurchases);

/**
 * @api {get} /api/purchases/:id Obtener detalle de una compra (Cliente)
 * @apiName GetPurchaseById
 * @apiGroup Purchases
 * @apiHeader {String} Authorization Bearer token.
 * @apiParam {Number} id ID único de la compra.
 */
router.get('/:id', [
  authenticate
], getPurchaseById);

/**
 * @api {get} /api/purchases Listar todas las compras (Admin)
 * @apiName GetAllPurchases
 * @apiGroup Purchases
 * @apiHeader {String} Authorization Bearer token.
 */
router.get('/', [
  authenticate,
  authorize(config.roles.ADMIN)
], getAllPurchases);

export default router;