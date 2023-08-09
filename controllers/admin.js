const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/Order");
const clearImage = require("../util/clearImage");

exports.getDashboard = async (req, res, next) => {
  var date = new Date();
  var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  try {
    const countUser = await User.countDocuments({ role: "user" });

    const allOrders = await Order.find({});

    const allOrdersOfMonth = allOrders.filter(
      (order) => order.createdAt >= firstDayOfMonth
    );

    const earningOfMonth = allOrdersOfMonth.reduce(
      (prev, value) => prev + +value.total,
      0
    );

    const newOrdersOfMonth = allOrdersOfMonth.length;

    res
      .status(200)
      .json({ countUser, allOrders, earningOfMonth, newOrdersOfMonth });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const foundProduct = await Product.findById(productId);
    foundProduct.images.forEach((imageUrl) => {
      const imagePath = imageUrl.replace(`${process.env.BACKEND_URL}/`, "");
      clearImage(`public\\${imagePath}`);
    });

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.postAddProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    for (let i = 0; i < req.files.length; i++) {
      clearImage(req.files[i].path);
    }

    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  if (req.files.length === 0) {
    return res
      .status(422)
      .json({ message: "Please provide at least 1 image!" });
  }

  const imagesArr = req.files.map(
    (file) =>
      `${process.env.BACKEND_URL}${file.path
        .replace("public", "")
        .replaceAll("\\", "/")}`
  );

  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    short_desc: req.body.shortdesc,
    long_desc: req.body.longdesc,
    images: imagesArr,
  });
  try {
    await newProduct.save();
    res.status(201).json({ message: "Product create successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went Wrong!" });
  }
};

exports.putEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  try {
    const foundProduct = await Product.findById(req.params.productId);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    foundProduct.name = req.body.name;
    foundProduct.price = req.body.price;
    foundProduct.category = req.body.category;
    foundProduct.short_desc = req.body.shortdesc;
    foundProduct.long_desc = req.body.longdesc;
    foundProduct.count = req.body.count;

    await foundProduct.save();
    res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went Wrong!" });
  }
};
