import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();

const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://root:congltph27602@asm-web209.hu4clmr.mongodb.net/?retryWrites=true&w=majority"
);

app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
