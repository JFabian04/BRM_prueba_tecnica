import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { uploadMultiple, handleMulterError } from '../middlewares/multerConfig.js';
import config from '../config/config.js';

const router = Router();

/**
 * @api {get} /api/products Listar productos
 * @apiName GetProducts
 * @apiGroup Products
 * @apiDescription Obtiene una lista de todos los productos disponibles en el sistema.
 *
 * @apiSuccess {Object[]} products Lista de productos.
 * @apiSuccess {Number} products.id ID del producto.
 * @apiSuccess {String} products.batchNumber Número de lote del producto.
 * @apiSuccess {String} products.name Nombre del producto.
 * @apiSuccess {Number} products.price Precio del producto.
 * @apiSuccess {Number} products.availableQuantity Cantidad disponible.
 * @apiSuccess {String} products.entryDate Fecha de ingreso (YYYY-MM-DD).
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  [
 *    {
 *      "id": 1,
 *      "batchNumber": "L001",
 *      "name": "Producto A",
 *      "price": 15000,
 *      "availableQuantity": 100,
 *      "entryDate": "2025-10-23"
 *    }
 *  ]
 */
router.get('/', getAllProducts);

/**
 * @api {get} /api/products/:id Obtener producto por ID
 * @apiName GetProductById
 * @apiGroup Products
 * @apiDescription Obtiene la información de un producto específico a partir de su ID.
 *
 * @apiParam {Number} id ID único del producto.
 *
 * @apiSuccess {Number} id ID del producto.
 * @apiSuccess {String} batchNumber Número de lote.
 * @apiSuccess {String} name Nombre del producto.
 * @apiSuccess {Number} price Precio del producto.
 * @apiSuccess {Number} availableQuantity Cantidad disponible.
 * @apiSuccess {String} entryDate Fecha de ingreso (YYYY-MM-DD).
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": 3,
 *    "batchNumber": "L003",
 *    "name": "Producto C",
 *    "price": 25000,
 *    "availableQuantity": 50,
 *    "entryDate": "2025-09-15"
 *  }
 *
 * @apiErrorExample {json} Producto no encontrado:
 *  HTTP/1.1 404 Not Found
 *  { "message": "Producto no encontrado" }
 */
router.get('/:id', getProductById);

/**
 * @api {post} /api/products Crear producto con imágenes (Admin)
 * @apiName CreateProduct
 * @apiGroup Products
 * @apiDescription Crea un nuevo producto en el sistema con una o más imágenes. Solo los usuarios con rol ADMIN pueden realizar esta acción.
 * El endpoint espera un FormData con los datos del producto y las imágenes.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 *
 * @apiBody {String} batchNumber Número de lote (obligatorio).
 * @apiBody {String} name Nombre del producto (obligatorio).
 * @apiBody {Number} price Precio del producto (mayor que 0).
 * @apiBody {Number} availableQuantity Cantidad disponible (>= 0).
 * @apiBody {String} entryDate Fecha de ingreso en formato ISO (YYYY-MM-DD).
 * @apiBody {Number} [categoryId] ID de la categoría a la que pertenece el producto (opcional).
 * @apiBody {File[]} images Archivos de imagen (máximo 5, formatos: jpg, png, gif, webp).
 * @apiBody {Number} mainImageIndex Índice de la imagen principal (0 para la primera imagen, 1 para la segunda, etc.).
 * @apiBody {String} [imagesMetadata] Opcional: JSON array con metadata por imagen (debe coincidir en longitud con `images`). Ejemplo: [{"isMainImage":true}]
 *
 * @apiExample {form} Ejemplo de Petición:
 *  POST /api/products
 *  Content-Type: multipart/form-data
 *  
 *  batchNumber: "L010"
 *  name: "Producto Nuevo"
 *  price: 29999.99
 *  availableQuantity: 40
 *  entryDate: "2025-10-25"
 *  images: [archivo1.jpg, archivo2.jpg]
 *  // O alternativamente enviar metadata por imagen:
 *  imagesMetadata: [{"isMainImage":true},{"isMainImage":false}]
 *  mainImageIndex: 0
 *
 * @apiSuccess {String} message Mensaje de éxito.
 * @apiSuccess {Object} product Datos del producto creado.
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 201 Created
 *  {
 *    "success": true,
 *    "message": "Producto creado exitosamente con imágenes",
 *    "data": {
 *      "id": 11,
 *      "batchNumber": "L010",
 *      "name": "Producto Nuevo",
 *      "price": 29999.99,
 *      "availableQuantity": 40,
 *      "entryDate": "2025-10-25",
 *      "category": { "id": 3, "name": "Snacks" },
 *      "images": [
 *        {
 *          "id": 1,
 *          "filename": "1698262458945-123456789.jpg",
 *          "originalName": "producto1.jpg",
 *          "mimetype": "image/jpeg",
 *          "size": 154200,
 *          "isMainImage": true
 *        },
 *        {
 *          "id": 2,
 *          "filename": "1698262458946-987654321.jpg",
 *          "originalName": "producto2.jpg",
 *          "mimetype": "image/jpeg",
 *          "size": 142800,
 *          "isMainImage": false
 *        }
 *      ]
 *    }
 *  }
 *
 * @apiErrorExample {json} Validación fallida:
 *  HTTP/1.1 400 Bad Request
 *  { 
 *    "success": false,
 *    "errors": [
 *      "El nombre es requerido",
 *      "El precio debe ser mayor a 0",
 *      "Se requiere al menos una imagen"
 *    ]
 *  }
 *
 * @apiErrorExample {json} Error en la carga de imágenes:
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "message": "Tipo de archivo no soportado. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)"
 *  }
 *
 * @apiErrorExample {json} Acceso denegado:
 *  HTTP/1.1 403 Forbidden
 *  { "message": "Acceso denegado" }
 */
router.post('/', [
  authenticate,
  authorize(config.roles.ADMIN),
  uploadMultiple,
  handleMulterError,
  body('batchNumber').trim().notEmpty().withMessage('El número de lote es requerido'),
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('price').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
  body('availableQuantity').isInt({ min: 0 }).withMessage('La cantidad debe ser mayor o igual a 0'),
  body('entryDate').isISO8601().withMessage('Fecha inválida'),
  body('categoryId').optional().isInt().withMessage('ID de categoría inválido'),
  validate
], createProduct);

/**
 * @api {put} /api/products/:id Actualizar producto con imágenes (Admin)
 * @apiName UpdateProduct
 * @apiGroup Products
 * @apiDescription Actualiza la información de un producto existente, incluyendo sus imágenes.
 * Permite agregar nuevas imágenes, eliminar existentes y establecer la imagen principal.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 * @apiParam {Number} id ID único del producto a actualizar.
 *
 * @apiBody {String} [batchNumber] Número de lote.
 * @apiBody {String} [name] Nombre del producto.
 * @apiBody {Number} [price] Precio del producto.
 * @apiBody {Number} [availableQuantity] Cantidad disponible.
 * @apiBody {String} [entryDate] Fecha de ingreso (YYYY-MM-DD).
 * @apiBody {File[]} [images] Archivos de imágenes (máximo 5).
 * @apiBody {Number} [mainImageIndex] Índice (0-based) de la imagen que será la principal si no se usa `imagesMetadata`.
 * @apiBody {String} [imagesMetadata] Opcional: JSON array con metadata por imagen (debe coincidir en longitud con `images`). Ejemplo: [{"isMainImage":true}]
 * @apiBody {Number} [categoryId] ID de la categoría a asignar al producto.
 * @apiBody {Number[]} [deleteImages] Opcional: Array JSON con IDs de imágenes existentes a eliminar. Ejemplo: [5,8]
 * @apiBody {Number} [mainImageId] Opcional: ID de una imagen ya existente para marcar como principal (útil cuando no se suben nuevas imágenes).
 *
 * @apiExample {form} Ejemplo de Petición con Imágenes y eliminación:
 *  PUT /api/products/3
 *  Content-Type: multipart/form-data
 *  
 *  price: 26000
 *  availableQuantity: 60
 *  images: [producto_frontal.jpg, producto_lateral.jpg]
 *  mainImageIndex: 0
 *  deleteImages: [5,8]
 *  // Asignar categoría por ID
 *  categoryId: 2
 *  // O usando metadata por archivo (en lugar de mainImageIndex):
 *  imagesMetadata: [{"isMainImage":true},{"isMainImage":false}]
 *
 * @apiSuccess {String} message Mensaje de éxito.
 * @apiSuccess {Object} data Producto actualizado con sus imágenes.
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "message": "Producto actualizado exitosamente",
 *    "data": {
 *      "id": 3,
 *      "batchNumber": "L003",
 *      "name": "Producto C",
 *      "price": 26000,
 *      "availableQuantity": 60,
 *      "entryDate": "2025-09-15",
 *      "category": { "id": 2, "name": "Bebidas" },
 *      "images": [
 *        {
 *          "id": 12,
 *          "filename": "1698262458945-123456789.jpg",
 *          "originalName": "producto1.jpg",
 *          "mimetype": "image/jpeg",
 *          "size": 154200,
 *          "isMainImage": true
 *        },
 *        {
 *          "id": 15,
 *          "filename": "1698262458946-987654321.jpg",
 *          "originalName": "producto2.jpg",
 *          "mimetype": "image/jpeg",
 *          "size": 142800,
 *          "isMainImage": false
 *        }
 *      ]
 *    }
 *  }
 *
 * @apiErrorExample {json} Error de Validación:
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "message": "El formato de deleteImages es inválido. Debe ser un array de IDs numéricos"
 *  }
 */
router.put('/:id', [
  authenticate,
  authorize(config.roles.ADMIN),
  uploadMultiple,
  handleMulterError,
  [
    body('batchNumber').optional().trim().isLength({ max: 50 }),
    body('name').optional().trim().isLength({ max: 100 }),
    body('price').optional().isFloat({ min: 0 }),
    body('availableQuantity').optional().isInt({ min: 0 }),
    body('entryDate').optional().isDate(),
  body('categoryId').optional().isInt().withMessage('ID de categoría inválido'),
    body('deleteImages').optional().custom(value => {
      // Accept several formats for deleteImages:
      // - JSON array string: "[1,2]"
      // - Comma-separated string: "1,2"
      // - Actual array (when Content-Type: application/json)
      if (value === undefined || value === null || value === '') return true;

      // If it's already an array (parsed by body-parser), validate items
      if (Array.isArray(value)) {
        return value.every(id => Number.isInteger(Number(id)));
      }

      // If it's a string, try JSON.parse first (to handle "[1,2]")
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed.every(id => Number.isInteger(Number(id)));
        } catch (e) {
          // not JSON, fall back to comma-separated
        }

        const ids = value.split(',').map(id => parseInt(id.trim())).filter(n => !Number.isNaN(n));
        return ids.length > 0 && ids.every(id => Number.isInteger(id));
      }

      return false;
    }).withMessage('IDs de imágenes a eliminar inválidos'),
    body('mainImageId').optional().isInt().withMessage('ID de imagen principal inválido')
  ],
  validate
], updateProduct);

/**
 * @api {delete} /api/products/:id Eliminar producto (Admin)
 * @apiName DeleteProduct
 * @apiGroup Products
 * @apiDescription Elimina un producto existente del sistema.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 * @apiParam {Number} id ID único del producto a eliminar.
 *
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  { "message": "Producto eliminado exitosamente" }
 *
 * @apiErrorExample {json} Producto no encontrado:
 *  HTTP/1.1 404 Not Found
 *  { "message": "Producto no encontrado" }
 */
router.delete('/:id', [
  authenticate, 
  authorize(config.roles.ADMIN)
], deleteProduct);

export default router;
