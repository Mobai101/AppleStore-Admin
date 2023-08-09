const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  short_desc: {
    type: String,
    required: true,
  },
  long_desc: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 20,
  },
  images: [{ type: String }],
});

module.exports = model("Product", productSchema);
