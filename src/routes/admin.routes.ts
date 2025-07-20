import { Router } from "express";
import {authenticate} from "../middlewares/authMiddleware"
import { authorizeAdmin } from "../middlewares/authorizeAdmin";
import { createProduct } from "../controllers/admin.controller";

const router = Router()

router.post("/products", authenticate, authorizeAdmin, createProduct);

export default router;