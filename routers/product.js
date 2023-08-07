import express from "express";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductById,
  getProductBySlug,
} from "../controllers/product.js";
import uploadCloud from "../config/cloudinary.config.js";
import { isAdmin, verifyAccessToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post(
  "/products",
  // [verifyAccessToken, isAdmin],
  uploadCloud.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createProduct
);

router.get("/products", getProducts);
router.get("/products/id/:id", getProductById);
router.get("/products/slug/:slug", getProductBySlug);

router.put(
  "/products/:id",
  // [verifyAccessToken, isAdmin],
  uploadCloud.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateProduct
);
router.delete("/products/:id", deleteProduct);

export default router;
