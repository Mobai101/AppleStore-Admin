const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    total: { type: Number, required: true },
    delivery: { type: String, default: "Waiting for processing" },
    status: { type: String, default: "Waiting for payment" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    orders: [{ type: Object }],
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
