import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
} from "../controllers/user.controller";
import { createOrder } from "../controllers/user.controller";
import { getUserPurchaseHistory } from "../controllers/user.controller";
import {createReview} from "../controllers/user.controller";
import { getMyAddresses, addAddress } from "../controllers/user.controller";

const router = Router();

router.get("/cart", authenticate, getCart);

router.post("/cart/items", authenticate, addToCart);

router.patch("/cart/items/:id", authenticate, updateCartItemQuantity);

router.delete("/cart/items/:id", authenticate, deleteCartItem);

router.post("/orders", authenticate, createOrder);

router.get("/user/purchase-history", authenticate, getUserPurchaseHistory);

router.post("/reviews", authenticate, createReview);

router.get("/addresses/my", authenticate, getMyAddresses)

router.post('/addresses', authenticate, addAddress);


export default router;
