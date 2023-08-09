const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Auth
exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  const newUser = new User({
    email: req.body.email,
    fullName: req.body.fullname,
    password: req.body.password,
    phoneNumber: req.body.phone,
    role: "user",
    cart: [],
  });
  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.postSignin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
      return res
        .status(422)
        .json({ message: "Email or password is not correct!" });
    }

    const checkPass = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );
    if (!checkPass) {
      return res
        .status(422)
        .json({ message: "Email or password is not correct!" });
    }
    const token = jwt.sign({ id: foundUser._id }, "super secret key");

    res.status(200).json({
      message: "Logged in successfully!",
      id_user: foundUser._id,
      token: token,
      email: foundUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// admin
exports.postAdminSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }
  try {
    const newUser = new User({
      email: req.body.email,
      fullName: req.body.fullName,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      cart: [],
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.postAdminSignin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.errors });
  }

  try {
    const foundUser = await User.findOne({ email: req.body.email });

    // Check if user is found (check email)
    if (!foundUser) {
      return res
        .status(422)
        .json({ message: "Email or password is not correct!" });
    }

    // check if password is correct
    const checkPass = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );
    if (!checkPass) {
      return res
        .status(422)
        .json({ message: "Email or password is not correct!" });
    }

    // Check if role is correct
    if (foundUser.role === "admin" || foundUser.role === "cs") {
      const token = jwt.sign({ id: foundUser._id }, "super secret key");
      return res.status(200).json({
        message: "Logged in successfully!",
        token: token,
        email: foundUser.email,
        role: foundUser.role,
      });
    } else {
      return res.status(403).json({ message: "Not authorized!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// User
exports.getUserDetail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw new Error("User not found!");
    }
    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
