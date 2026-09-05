const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // console.log(token);

    // 1. ADDED 'return' and changed status to 401
    if (!token) {
      return res.status(401).json({
        message: "Token is missing. Please login again.",
      });
    }

    // 2. verify() will throw an error to the catch block if it fails.
    // No need to check if (!decodedToken) afterwards.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken);
    const { _id } = decodedToken;

    // 3. Security: Exclude the password (or other sensitive data) from being attached to req.user
    const user = await User.findById(_id).select("-password");

    // 4. ADDED 'return'
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    // 5. Changed status to 401 (Unauthorized) instead of 400
    return res.status(401).json({
      message: "Authentication failed: " + err.message,
    });
  }
};

module.exports = {
  userAuth,
};
