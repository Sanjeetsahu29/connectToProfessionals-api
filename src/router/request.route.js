const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/user.model");

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const ALLOWED_STATUS = ["interested", "ignored"];
    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid connection status: " + status });
    }

    // User should not be able send the connection request to himself

    // we should validate the toUserId request parameter. Using this id, query the database
    // whether the user exists with this id or not

    // implement -> you can't send this connection request because this user have either deactivated or deleted his/her account
    const toUserExists = await User.findById(toUserId);
    console.log(toUserExists);
    if (!toUserExists) {
      return res.status(404).json({
        message:
          "Connection request can't be sent because this user doesn't exist",
      });
    }

    //If there is an existing Connection Request then we won't send the request
    //I have send the connection once then I shouldn't be able to send the connection request to the same user
    // or If I have recieved the connection request then I also shouldn't able to send the connection request

    //implement match -> if you send the connection request to those user who have already sent you the connection request then it is a match
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already exists" });
    }
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const connectionRequestData = await connectionRequest.save();
    return res.status(200).json({
      message: "Connection request sent successfully",
      connectionRequestData,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error in sending connection request" + err.message });
  }
});
module.exports = requestRouter;
