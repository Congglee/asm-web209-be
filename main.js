import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
dotenv.config();

import productRoute from "./routers/product.js";
import categoryRoute from "./routers/category.js";
import userRoute from "./routers/user.js";

const app = express();

const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", userRoute);

mongoose
  .connect(
    "mongodb+srv://root:congltph27602@asm-web209.hu4clmr.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB connected"));

app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
