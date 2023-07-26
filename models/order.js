import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Types.ObjectId, ref: "Product" },
      count: Number,
    },
  ],
  status: {
    type: String,
    default: "Proccessing",
    enum: ["Cancelled", "Proccessing", "Succeed"],
  },
  total: Number,
  orderBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

//Export the model
export default mongoose.model("Order", orderSchema);
