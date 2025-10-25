import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import config from '../config/config.js';

const router = Router();

/**
 * @api {get} /api/categories Listar categorías
 * @apiName GetCategories
 * @apiGroup Categories
 * @apiDescription Obtiene la lista de categorías activas del sistema. Soporta paginación mediante query params `page` y `limit`.
 *
 * @apiParam (Query) {Number} [page=1] Página a retornar.
 * @apiParam (Query) {Number} [limit=20] Cantidad de elementos por página.
 *
 * @apiSuccess {Object[]} data Lista de categorías.
 * @apiSuccess {Number} data.id ID de la categoría.
 * @apiSuccess {String} data.name Nombre de la categoría.
 * @apiSuccess {String} data.description Descripción (opcional).
 * @apiSuccess {Boolean} data.active Indicador si la categoría está activa.
 * @apiSuccess {Object} meta Metadatos de paginación.
 * @apiSuccess {Number} meta.total Total de categorías encontradas.
 * @apiSuccess {Number} meta.page Página actual.
 * @apiSuccess {Number} meta.limit Límite por página.
 * @apiSuccess {Number} meta.totalPages Número total de páginas.
 *
 * @apiExample {curl} Ejemplo:
 *   curl -X GET "http://localhost:3000/api/categories?page=1&limit=10"
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": [
 *      {"id":1, "name":"Snacks", "description":"", "active":true},
 *      {"id":2, "name":"Bebidas", "description":"", "active":true}
 *    ],
 *    "meta": {"total":2, "page":1, "limit":10, "totalPages":1}
 *  }
 */
router.get('/', categoryController.getAllCategories);

/**
 * @api {get} /api/categories/:id Obtener categoría por ID
 * @apiName GetCategoryById
 * @apiGroup Categories
 * @apiDescription Obtiene los datos de una categoría por su ID.
 *
 * @apiParam {Number} id ID único de la categoría.
 *
 * @apiSuccess {Number} id ID de la categoría.
 * @apiSuccess {String} name Nombre de la categoría.
 * @apiSuccess {String} description Descripción (opcional).
 * @apiSuccess {Boolean} active Indicador si la categoría está activa.
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  { "success": true, "data": { "id": 1, "name": "Snacks", "description": "", "active": true } }
 *
 * @apiErrorExample {json} No encontrada:
 *  HTTP/1.1 404 Not Found
 *  { "success": false, "message": "Categoría no encontrada" }
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @api {post} /api/categories Crear categoría (Admin)
 * @apiName CreateCategory
 * @apiGroup Categories
 * @apiDescription Crea una nueva categoría. Requiere rol ADMIN.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 *
 * @apiBody {String} name Nombre de la categoría (obligatorio).
 * @apiBody {String} [description] Descripción opcional.
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 201 Created
 *  { "success": true, "message": "Categoría creada", "data": { "id": 10, "name": "Lácteos", "description": "", "active": true } }
 *
 * @apiErrorExample {json} Validación fallida:
 *  HTTP/1.1 400 Bad Request
 *  { "success": false, "errors": [{ "field": "name", "message": "El nombre es requerido" }] }
 */
router.post('/', [
  authenticate,
  authorize(config.roles.ADMIN),
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  validate
], categoryController.createCategory);

/**
 * @api {put} /api/categories/:id Actualizar categoría (Admin)
 * @apiName UpdateCategory
 * @apiGroup Categories
 * @apiDescription Actualiza los datos de una categoría existente. Requiere rol ADMIN.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 * @apiParam {Number} id ID único de la categoría.
 *
 * @apiBody {String} [name] Nuevo nombre.
 * @apiBody {String} [description] Nueva descripción.
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  { "success": true, "message": "Categoría actualizada", "data": { "id": 10, "name": "Lácteos", "description": "Productos lácteos", "active": true } }
 *
 * @apiErrorExample {json} No encontrada:
 *  HTTP/1.1 404 Not Found
 *  { "success": false, "message": "Categoría no encontrada" }
 */
router.put('/:id', [
  authenticate,
  authorize(config.roles.ADMIN),
  body('name').optional().trim().isLength({ max: 100 }),
  validate
], categoryController.updateCategory);

/**
 * @api {delete} /api/categories/:id Eliminar categoría (Admin)
 * @apiName DeleteCategory
 * @apiGroup Categories
 * @apiDescription Elimina (soft-delete) una categoría estableciendo `active=false`. Requiere rol ADMIN.
 *
 * @apiHeader {String} Authorization Bearer token del administrador.
 * @apiParam {Number} id ID único de la categoría.
 *
 * @apiSuccessExample {json} Respuesta Exitosa:
 *  HTTP/1.1 200 OK
 *  { "success": true, "message": "Categoría eliminada" }
 *
 * @apiErrorExample {json} No encontrada:
 *  HTTP/1.1 404 Not Found
 *  { "success": false, "message": "Categoría no encontrada" }
 */
router.delete('/:id', [
  authenticate,
  authorize(config.roles.ADMIN)
], categoryController.deleteCategory);

export default router;
