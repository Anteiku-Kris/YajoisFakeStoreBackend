import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getCart, addToCart, updateCartItemQuantity, deleteCartItem } from "../controllers/user.controller";

const router = Router();

router.get("/cart", authenticate, getCart);

router.post("/cart/items", authenticate, addToCart)

router.patch("/cart/items/:id", authenticate, updateCartItemQuantity)

router.delete("/cart/items/:id", authenticate, deleteCartItem)

export default router;
