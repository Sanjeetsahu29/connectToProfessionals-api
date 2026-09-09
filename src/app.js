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
const cors = require("cors");
dotenv.config();
// to the read the cookies from the request, else it will be undefined.
// This middleware will parse the cookies and make them available in req.cookies
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
/*
  * What does it do?
    cors() → Allows your backend to accept requests from a different origin.
    origin: "http://localhost:5173" → Only allows requests from your React/Vite frontend running on port 5173.
    credentials: true → Allows credentials such as cookies and authorization information to be sent with cross-origin requests.
    app.use() → Applies this CORS configuration to your Express application.

  * INTERVIEW QUESTIONS
    * Beginner Level Questions
      1. What is CORS?
         CORS stands for Cross-Origin Resource Sharing. It is a browser security mechanism that controls 
         whether a web application can request resources from a different origin.

      2. Why do we need CORS?
         Because browsers restrict cross-origin requests by default to protect users from malicious websites.

    * Intermediate Level Questions
      4. What does origin do in the CORS configuration?
         origin: "http://localhost:5173". It specifies which frontend origin is allowed to access the backend.
      
      5. What does credentials: true mean?
         It allows cross-origin requests to include credentials such as cookies. 
         
         Frontend
         axios.get("http://localhost:3000/user", {
          withCredentials: true
         });

         Backend
         cors({
          origin: "http://localhost:5173",
          credentials: true
         });

      6. Why shouldn't we use origin: "*" with credentials?
         Because browsers don't allow origin: "*" for credentialed CORS requests. You should specify the exact allowed origin.

      7. Is CORS a backend security feature?
         Not exactly. CORS primarily controls browser behavior. It does not prevent Postman, curl, or another server from directly calling your API.

      8. What is a preflight request?
         For certain cross-origin requests, the browser first sends an OPTIONS request to the server to ask: "Is this request allowed?"
         The server responds with appropriate CORS headers, and then the browser sends the actual request.
*/
const port = process.env.PORT || 3000;

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
