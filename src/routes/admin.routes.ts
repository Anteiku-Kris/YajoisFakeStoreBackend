import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorizeAdmin } from "../middlewares/authorizeAdmin";
import { createProduct, updateProduct, uploadProductImage, deleteProductImage, getAllUsers } from "../controllers/admin.controller";
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

router.post(
  "/product-images",
  authenticate,
  authorizeAdmin,
  upload.single("image"),
  uploadProductImage
);

router.delete(
  "/product-images/:id", authenticate, authorizeAdmin, deleteProductImage
);


router.get(
  "/users",
  authenticate,
  authorizeAdmin,
  getAllUsers
);


export default router;
