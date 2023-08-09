const express = require("express");
const {
  postSignup,
  postSignin,
  getUserDetail,
  postAdminSignup,
  postAdminSignin,
} = require("../controllers/auth");
const {
  postSignupValidator,
  postSigninValidator,
  postAdminSignupValidator,
  postAdminSigninValidator,
} = require("../util/validator");
const authUser = require("../util/authUser");
const router = express.Router();

// Auth
router.post("/signup", postSignupValidator, postSignup);

router.post("/signin", postSigninValidator, postSignin);

// admin
router.post("/admin/signup", postAdminSignupValidator, postAdminSignup);

router.post("/admin/signin", postAdminSigninValidator, postAdminSignin);

// User
router.get("/:userId", authUser, getUserDetail);

module.exports = router;
