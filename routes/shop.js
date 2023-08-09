const express = require("express");
const {
  getProducts,
  getDetail,
  getPagination,
  postAddToCart,
  getCarts,
  deleteToCart,
  putToCart,
  postOrder,
  getOrderHistory,
  getOrderDetail,
} = require("../controllers/shop");
const authUser = require("../util/authUser");
const { postOrderValidator } = require("../util/validator");
const router = express.Router();

// GetAPI
router.get("/products", getProducts);

// GetPagination
router.get("/products/pagination", getPagination);

// GetDetail
router.get("/products/:productId", getDetail);

// Cart
router.get("/carts", authUser, getCarts);
router.post("/carts/add", authUser, postAddToCart);
router.delete("/carts/delete", authUser, deleteToCart);
router.put("/carts/update", authUser, putToCart);

// Order
router.post("/email", authUser, postOrderValidator, postOrder);
router.get("/histories", authUser, getOrderHistory);
router.get("/histories/:orderId", authUser, getOrderDetail);

module.exports = router;
