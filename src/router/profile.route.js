const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user.model");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error finding profile of a user: " + err.message });
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);
    const updateData = req.body;
    console.log("Edit profile data is validated");
    const user = req.user;
    const updatedUser = await User.findByIdAndUpdate(
      { _id: user._id },
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (updatedUser) {
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    if (err.message.includes("Invalid update fields.")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({
      message: "Error updating user",
      error: err.message,
    });
  }
});

module.exports = profileRouter;
