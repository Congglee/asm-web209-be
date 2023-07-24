import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
dotenv.config();
import productRoute from "./routers/product.js";
import categoryRoute from "./routers/category.js";
import userRouter from "./routers/user.js"

const app = express();

const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", userRouter);

mongoose.connect("mongodb+srv://root:congltph27602@asm-web209.hu4clmr.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("DB connected"))

app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
