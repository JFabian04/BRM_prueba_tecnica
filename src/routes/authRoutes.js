import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';

const router = Router();

/**
 * @api {post} /api/auth/register Registrar usuario
 * @apiName Register
 * @apiGroup Auth
 * @apiDescription Registra un nuevo usuario en el sistema.
 *
 * @apiBody {String} name Nombre del usuario.
 * @apiBody {String} email Email único del usuario.
 * @apiBody {String} password Contraseña (mínimo 6 caracteres).
 * @apiBody {String="admin","client"} [role=client] Rol del usuario.
 *
 * @apiSuccess {Boolean} success Indica si la solicitud fue exitosa.
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccess {Object} data Contenedor de la respuesta.
 * @apiSuccess {Object} data.user Información del usuario creado.
 * @apiSuccess {String} data.token Token de autenticación JWT.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Usuario registrado exitosamente",
 *       "data": {
 *         "user": {
 *           "id": 1,
 *           "name": "John Doe",
 *           "email": "john.doe@example.com",
 *           "role": "client",
 *           "updatedAt": "2025-10-25T06:00:00.000Z",
 *           "createdAt": "2025-10-25T06:00:00.000Z"
 *         },
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       }
 *     }
 *
 * @apiError (400 Bad Request) ValidationError Errores de validación en los campos.
 * @apiErrorExample {json} Error-Response (Validation):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Errores de validación",
 *       "errors": [
 *         { "msg": "La contraseña debe tener mínimo 6 caracteres", "param": "password", "location": "body" }
 *       ]
 *     }
 * @apiError (500 Internal Server Error) EmailInUse El email proporcionado ya está en uso.
 */
router.post('/register', [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
  body('role').optional().isIn(['admin', 'client']).withMessage('Rol inválido'),
  validate
], register);

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Autentica a un usuario y devuelve un token de acceso.
 *
 * @apiBody {String} email Email del usuario.
 * @apiBody {String} password Contraseña del usuario.
 *
 * @apiSuccess {Boolean} success Indica si la solicitud fue exitosa.
 * @apiSuccess {String} message Mensaje de confirmación.
 * @apiSuccess {Object} data Contenedor de la respuesta.
 * @apiSuccess {Object} data.user Información del usuario.
 * @apiSuccess {String} data.token Token de autenticación JWT.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Login exitoso",
 *       "data": {
 *         "user": {
 *           "id": 1,
 *           "name": "John Doe",
 *           "email": "john.doe@example.com",
 *           "role": "client"
 *         },
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       }
 *     }
 *
 * @apiError (401 Unauthorized) InvalidCredentials Las credenciales proporcionadas son incorrectas.
 * @apiErrorExample {json} Error-Response (Invalid Credentials):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Credenciales inválidas"
 *     }
 */
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate
], login);

/**
 * @api {get} /api/auth/profile Obtener perfil
 * @apiName GetProfile
 * @apiGroup Auth
 * @apiDescription Obtiene el perfil del usuario autenticado.
 *
 * @apiHeader {String} Authorization Bearer token de autenticación.
 *
 * @apiSuccess {Boolean} success Indica si la solicitud fue exitosa.
 * @apiSuccess {Object} data Información del perfil del usuario.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "email": "john.doe@example.com",
 *         "role": "client"
 *       }
 *     }
 *
 * @apiError (401 Unauthorized) Unauthorized El token no fue proporcionado o es inválido.
 * @apiErrorExample {json} Error-Response (Unauthorized):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Token no proporcionado o inválido"
 *     }
 */
router.get('/profile', authenticate, getProfile);

export default router;