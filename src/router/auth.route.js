const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { validateSignupData } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    const savedUser = await newUser.save();
    res.status(201).json({
      message: "New user saved successfully to the database",
      user: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error saving user to the database",
      error: err.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }
    // if the password is valid and user exist in the database
    // generate a token and put it the cookie and send the response to the client
    // this cookies will be used to authenticate the user in the future requests
    // as this cookie will be sent with every request to the server
    // res.cookie("token", "dummyToken");
    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(200).json({
      message: "Login successful",
      user: user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error during login",
      error: err.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict", // match what you originally set
  });
  res.status(200).json({ message: "Logout successfully" });
});

module.exports = authRouter;
