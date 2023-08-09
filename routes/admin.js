const express = require("express");
const User = require("../models/user");
const fileUpload = require("../util/fileUpload");
const {
  getDashboard,
  deleteProduct,
  postAddProduct,
  putEditProduct,
} = require("../controllers/admin");
const authAdmin = require("../util/authAdmin");
const { postAddProductValidator } = require("../util/validator");
const router = express.Router();

router.get("/", authAdmin, getDashboard);

// Products
router.delete("/delete/:productId", authAdmin, deleteProduct);

router.post(
  "/product/add",
  authAdmin,
  fileUpload.array("images"),
  postAddProductValidator,
  postAddProduct
);

router.put(
  "/product/edit/:productId",
  authAdmin,
  fileUpload.none(),
  postAddProductValidator,
  putEditProduct
);

module.exports = router;
