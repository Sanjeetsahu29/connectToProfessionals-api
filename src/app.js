const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user.model");
const dotenv = require("dotenv");
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
  const { firstName, lastName, email, password } = req.body;
  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });

  try {
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
  try {
    const updateUser = await User.findOneAndUpdate(
      { email: emailID },
      updateData,
      { returnDocument: true, runValidators: true },
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
