import {Router} from 'express';
import { getAllCategories } from '../controllers/categories.controller';
import { getProductsByCategory } from '../controllers/categories.controller';

const router = Router();

//GET /api/categories - Lista de todas las categorías
router.get('/', getAllCategories);
router.get('/:id/products', getProductsByCategory);


export default router;