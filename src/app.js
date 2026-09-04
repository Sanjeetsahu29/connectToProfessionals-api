const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user.model");
const dotenv = require("dotenv");
const { validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
dotenv.config();
app.use(express.json());

const port = process.env.PORT || 4000;

app.get("/user", async (req, res) => {
  const { emailID } = req.body;
  try {
    const user = await User.findOne({ email: emailID });
    console.log(user);
    if (user) {
      res.status(200).json({
        message: "User found",
        user: user,
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error finding user",
      error: err.message,
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find({});
    if (allUsers.length === 0) {
      res.status(200).json({
        message: "No users found",
        users: allUsers,
      });
    } else {
      res.status(200).json({
        message: `Total ${allUsers.length} users are there in the database`,
        users: allUsers,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error finding users",
      error: err.message,
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email: req.body.email });
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }

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

app.delete("/user", async (req, res) => {
  const { emailID } = req.body;
  try {
    const deletedUser = await User.findOneAndDelete({ email: emailID });
    if (deletedUser) {
      res.status(200).json({
        message: "User deleted successfully",
        user: deletedUser,
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error deleting user",
      error: err.message,
    });
  }
});

app.patch("/user", async (req, res) => {
  const { emailID, ...updateData } = req.body;
  // console.log("Update Data:", updateData);

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No update data provided",
      });
    }
    const ALLOWED_FIELDS = [
      "lastName",
      "about",
      "profilePhoto",
      "age",
      "skills",
      "interests",
    ];
    const isValidUpdate = Object.keys(updateData).every((field) => {
      return ALLOWED_FIELDS.includes(field);
    });
    if (!isValidUpdate) {
      return res.status(400).json({
        message:
          "Invalid update fields. Only lastName, about, profilePhoto, age, skills, and interests can be updated.",
      });
    }
    const updateUser = await User.findOneAndUpdate(
      { email: emailID },
      updateData,
      { returnDocument: "", runValidators: true },
    );
    if (updateUser) {
      res.status(200).json({
        message: "User updated successfully",
        user: updateUser,
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error updating user",
      error: err.message,
    });
  }
});

connectDB()
  .then(() => {
    console.log("Connected to the database");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });
