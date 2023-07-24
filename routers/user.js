import express from "express";
import { register, login, logOut } from "../controllers/user.js";

const router = express.Router();

router.post("/users/register", register);
router.post("/users/login", login);
router.post("/users/logOut", logOut);

export default router;
