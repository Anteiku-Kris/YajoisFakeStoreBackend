import {Router} from 'express';
import { getAllProducts } from '../controllers/products.controller';

const router = Router();

//GET /api/products - Lista todos los productos
router.get('/', getAllProducts);

export default router;