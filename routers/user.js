import express from "express";
import {
  register,
  login,
  logOut,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateCart,
  updateCarts,
} from "../controllers/user.js";
import { isAdmin, verifyAccessToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/users/register", register);
router.post("/users/login", login);
router.post("/users/logOut", logOut);

router.get("/users", [verifyAccessToken, isAdmin], getUsers);
router.get("/users/:id", verifyAccessToken, getUser);

router.put("/users/updateClient/:id", verifyAccessToken, updateUser);
router.put("/users/updateCart", [verifyAccessToken], updateCart);
router.put("/users/updateCarts", [verifyAccessToken], updateCarts);
router.delete("/users/:id", [verifyAccessToken, isAdmin], deleteUser);

export default router;
