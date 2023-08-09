const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authAdmin = async (req, res, next) => {
  const userToken = req.headers.authorization;

  try {
    if (!userToken) {
      throw new Error("Not authorized!");
    }

    // Extract token from request headers
    const tokenKey = req.headers.authorization.split(" ")[1];
    const userId = jwt.verify(tokenKey, "super secret key").id;

    // find user from database
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw new Error("Not authorized!");
    }

    if (foundUser.role !== "admin") {
      throw new Error("Not authorized!");
    }

    // set user object in request to the found user, just in case
    req.user = foundUser;

    next();
  } catch (error) {
    res.status(403).json({ message: "Not authorized!" });
  }
};

module.exports = authAdmin;
