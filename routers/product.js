import express from "express";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductById,
  getProductBySlug,
} from "../controllers/product.js";

const router = express.Router();

router.post("/products", createProduct);
router.get("/products", getProducts);
router.get("/products/id/:id", getProductById);
router.get("/products/slug/:slug", getProductBySlug);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
