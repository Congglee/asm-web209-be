import express from "express";
import {
  createOrder,
  getOrders,
  getUserOrder,
  updateStatus,
} from "../controllers/order.js";
import { isAdmin, verifyAccessToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/orders", [verifyAccessToken], createOrder);
router.put("/orders/status/:id", [verifyAccessToken, isAdmin], updateStatus);

router.get("/orders", [verifyAccessToken], getUserOrder);
router.get("/orders/admin", [verifyAccessToken, isAdmin], getOrders);

export default router;
