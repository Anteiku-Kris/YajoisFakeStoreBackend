import { Router } from "express";
import { getAllReviews } from "../controllers/reviews.controller";

const router = Router();

//GET /api/reviews - Lista todas las reseñas públicas

router.get("/", getAllReviews);

export default router;
