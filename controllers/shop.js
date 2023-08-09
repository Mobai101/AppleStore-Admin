const Product = require("../models/product");
const User = require("../models/user");
const addImgProps = require("../util/imgProp");
const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const mailer = require("../util/mailer");

// getAPI
exports.getProducts = async (req, res, next) => {
  const search = req.query.search;
  let allProducts;
  try {
    if (search) {
      allProducts = await Product.find({
        name: { $regex: search, $options: "i" },
      });
    } else {
      allProducts = await Product.find({});
    }

    if (!allProducts) {
      throw new Error("No product found");
    }

    const returnProducts = allProducts.map((product) => {
      return addImgProps(product);
    });

    res.status(200).json(returnProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getDetail
exports.getDetail = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      return res.status(500).json({ message: "No product found!" });
    }

    const productsArr = addImgProps(foundProduct);

    res.status(200).json(productsArr);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// getPagination
exports.getPagination = async (req, res, next) => {
  let foundProducts = [];
  try {
    if (req.query.category === "all") {
      foundProducts = await Product.find({
        name: { $regex: req.query.search, $options: "i" },
      })
        .skip(Number(req.query.count) * Number(req.query.page - 1))
        .limit(Number(req.query.count));
    } else {
      foundProducts = await Product.find({
        category: req.query.category,
        name: { $regex: req.query.search, $options: "i" },
      })
        .skip(Number(req.query.count) * Number(req.query.page - 1))
        .limit(Number(req.query.count));
    }

    const returnProducts = foundProducts.map((product) => {
      return addImgProps(product);
    });

    res.status(200).json(returnProducts);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Cart

exports.getCarts = async (req, res, next) => {
  const userId = req.query.idUser;
  try {
    const foundUser = await User.findById(userId).populate("cart.productId");
    if (!foundUser) {
      return res.status(500).json({ message: "Found no User!" });
    }

    let returnCart = JSON.parse(JSON.stringify(foundUser.cart));
    returnCart = returnCart.map((item) => {
      return { ...item, userId: foundUser._id };
    });

    res.status(200).json(returnCart);
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

exports.postAddToCart = async (req, res, next) => {
  console.log(req.query);
  const cartItem = {
    count: req.query.count,
    productId: req.query.idProduct,
  };

  try {
    const foundUser = await User.findById(req.query.idUser);
    if (!foundUser) {
      return res.status(500).json({ message: "Found no User!" });
    }

    let foundCartItem = foundUser.cart.find(
      (item) => item.productId.toString() === cartItem.productId
    );

    if (!foundCartItem) {
      foundUser.cart.push(cartItem);
    } else {
      foundCartItem.count += +cartItem.count;
    }

    console.log(foundCartItem);
    await foundUser.save();
    res.status(201).json({ message: "Added to cart successfully!" });
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

exports.deleteToCart = async (req, res, next) => {
  const userId = req.query.idUser;
  const productId = req.query.idProduct;
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(500).json({ message: "Found no User!" });
    }

    const foundCartitemIndex = foundUser.cart.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (foundCartitemIndex < 0) {
      return res.status(500).json({ message: "Found no Cart Item!" });
    }

    foundUser.cart.splice(foundCartitemIndex, 1);
    await foundUser.save();
    res.status(200).json({ message: "Cart item Deleted successfully!" });
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

exports.putToCart = async (req, res, next) => {
  const count = req.query.count;
  const userId = req.query.idUser;
  const productId = req.query.idProduct;
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(500).json({ message: "Found no User!" });
    }

    const foundCartitem = foundUser.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (!foundCartitem) {
      return res.status(500).json({ message: "Found no Cart Item!" });
    }

    foundCartitem.count = count;
    await foundUser.save();
    res.status(200).json({ message: "Cart editted successfully!" });
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

// Order

exports.getOrderHistory = async (req, res, next) => {
  const userId = req.query.idUser;
  try {
    const foundOrders = await Order.find({ user: userId });
    if (!foundOrders) {
      return res.status(404).json({ message: "No order found!" });
    }
    res.status(200).json(foundOrders);
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

exports.getOrderDetail = async (req, res, next) => {
  const orderId = req.params.orderId;
  console.log(orderId);
  console.log(req.user);

  try {
    const foundOrder = await Order.findById(orderId);

    if (!foundOrder) {
      return res.status(404).json({ message: "No order found!" });
    }

    if (
      req.user._id.toString() !== foundOrder.user.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized!" });
    }

    res.status(200).json(foundOrder);
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};

exports.postOrder = async (req, res, next) => {
  // validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  try {
    // find User to get cart data
    const foundUser = await User.findById(req.body.idUser)
      .populate("cart.productId")
      .select("-cart._id");

    if (!foundUser) {
      return res.status(500).json({ message: "Found no User!" });
    }

    const productsArr = [];
    // validate if inventory is sufficient
    for (let i = 0; i < foundUser.cart.length; i++) {
      // if cart count > product count: return error
      if (foundUser.cart[i].count > foundUser.cart[i].productId.count) {
        return res
          .status(422)
          .json({
            message: `Not enough inventory for product: ${foundUser.cart[i].productId.name}`,
          });
      }

      // fill productsArr with Product instances to edit count below
      const foundProduct = await Product.findById(
        foundUser.cart[i].productId._id
      );
      productsArr.push(foundProduct);
    }

    // Updae count of each products in cart
    for (let i = 0; i < productsArr.length; i++) {
      productsArr[i].count -= +foundUser.cart[i].count;
      await productsArr[i].save();
    }

    // calculate total money of order
    const total = foundUser.cart.reduce(
      (prev, val) => prev + +val.count * +val.productId.price,
      0
    );

    // get shallow copy of cart to store in order
    const returnCart = JSON.parse(JSON.stringify(foundUser.cart));

    // Init new Order
    const newOrder = new Order({
      fullName: req.body.fullname,
      email: req.body.to,
      phoneNumber: req.body.phone,
      address: req.body.address,
      total,
      user: req.body.idUser,
      orders: returnCart,
    });
    await newOrder.save();

    // set cart of user to empty
    foundUser.cart = [];
    await foundUser.save();

    res.render(
      "emailTemplate",
      {
        user: req.body.fullname,
        email: req.body.to,
        phone: req.body.phone,
        address: req.body.address,
        total: total,
        cart: returnCart,
      },
      function (err, html) {
        if (err) {
          console.log("error rendering email template:", err);
          return;
        }

        mailer.sendMail({
          to: req.body.to,
          from: process.env.SENDGRID_FROMEMAIL,
          subject: "Ordered Successfully!",
          html: html,
        });
      }
    );

    res.status(201).json({ message: "New Order created!" });
  } catch (error) {
    res.status(500).json("Something went Wrong!");
  }
};
