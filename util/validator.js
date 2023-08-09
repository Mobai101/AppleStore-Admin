const { query, body } = require("express-validator");
const User = require("../models/user");

exports.postSignupValidator = [
  body("email", "Please enter a valid Email!")
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const foundUser = await User.findOne({ email: value });
      if (foundUser) {
        throw new Error("User already Exist!");
      } else {
        return true;
      }
    }),
  body("password", "Password must be at least 6 characters!").isLength({
    min: 6,
  }),
  body("fullname", "Please enter your full name!").notEmpty().trim(),
  body("phone", "Please enter your phone number!")
    .notEmpty()
    .isMobilePhone("vi-VN"),
];

exports.postSigninValidator = [
  body("email", "Please enter a valid Email!")
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("password", "Password must be at least 6 characters!").isLength({
    min: 6,
  }),
];

exports.postAdminSignupValidator = [
  body("email", "Please enter a valid Email!")
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const foundUser = await User.findOne({ email: value });
      if (foundUser) {
        throw new Error("User already Exist!");
      } else {
        return true;
      }
    }),
  body("password", "Password must be at least 6 characters!").isLength({
    min: 6,
  }),
  body("fullName", "Please enter your full name!").notEmpty().trim(),
  body("phoneNumber", "Please enter your phone number!")
    .notEmpty()
    .isMobilePhone("vi-VN"),
  body("role", "Invalid Role!")
    .notEmpty()
    .custom((value) => {
      if (value === "user" || value === "admin" || value === "cs") {
        return true;
      } else {
        return false;
      }
    }),
];

exports.postAdminSigninValidator = [
  body("email", "Please enter a valid Email!")
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("password", "Password must be at least 6 characters!").isLength({
    min: 6,
  }),
];

exports.postOrderValidator = [
  body("to", "Please enter a valid Email!").trim().isEmail().normalizeEmail(),
  body("fullname", "Please enter full name!").trim().notEmpty(),
  body("address", "Please enter address!").trim().notEmpty(),
  body("phone", "Please enter phone!").trim().notEmpty(),
];

exports.postAddProductValidator = [
  body("name", "Product name must be at least 5 characters!").trim().isLength({
    min: 5,
  }),
  body("category", "Category must not exceed 10 characters!").trim().isLength({
    max: 10,
  }),
  body("price", "Please input price!").trim().isNumeric(),
  body("shortdesc", "Please input Short Description!").trim().notEmpty(),
  body("longdesc", "Please input Long Description!").trim().notEmpty(),
];
