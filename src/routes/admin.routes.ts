import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorizeAdmin } from "../middlewares/authorizeAdmin";
import { createProduct } from "../controllers/admin.controller";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.post(
  "/products",
  authenticate,
  authorizeAdmin,
  upload.single("image"),
  createProduct
);

router.use("/products/:id",
    authenticate,
    authorizeAdmin,
    upload.single("image"),
    updateProduct
);

export default router;
