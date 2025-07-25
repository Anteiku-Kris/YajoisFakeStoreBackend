import { Router } from 'express';
import { getAllProducts } from '../controllers/products.controller';

const router = Router();

//#region Productos - Rutas

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Operaciones relacionadas con los productos
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos disponibles
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   category_id:
 *                     type: string
 *                     format: uuid
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/', getAllProducts);

//#endregion

export default router;
