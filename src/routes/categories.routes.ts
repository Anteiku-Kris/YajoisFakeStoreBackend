import {Router} from 'express';
import { getAllCategories } from '../controllers/categories.controller';

const router = Router();

//GET /api/categories - Lista de todas las categorías
router.get('/', getAllCategories);

export default router;