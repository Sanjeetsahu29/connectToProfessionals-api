const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user.model");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { userAuth } = require("./middlewares/auth");
const authRouter = require("./router/auth.route");
const profileRouter = require("./router/profile.route");
const requestRouter = require("./router/request.route");
const userRouter = require("./router/user.route");

dotenv.config();
// to the read the cookies from the request, else it will be undefined.
// This middleware will parse the cookies and make them available in req.cookies
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 4000;

app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find({}).select("-password");
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

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  console.log("Sending a connection request");
  res
    .status(200)
    .json({ message: `${user.firstName} has sent you connection request` });
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/request", requestRouter);
app.use("/api/v1/user", userRouter);

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
