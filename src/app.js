const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user.model");
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());

const port = process.env.PORT || 4000;
app.post("/signup", async (req, res) => {
  //creating a new instance of the User model with the data
  // const newUser = new User({
  //   firstName: "Sanjeet",
  //   lastName: "Sahu",
  //   email: "Sanjeet@gmail.com",
  //   password: "Sanjeet@123",
  // });
  console.log("Request body:", req.body);

  // try {
  //   const savedUser = await newUser.save();
  //   res.status(201).json({
  //     message: "New user saved successfully to the database",
  //     user: savedUser,
  //   });
  // } catch (err) {
  //   res.status(500).json({
  //     message: "Error saving user to the database",
  //     error: err.message,
  //   });
  // }
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
