const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;

    const ALLOWED_STATUS = ["interested", "ignored"];

    // 1. Validate status
    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid connection status: " + status });
    }

    //2. Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // 3. Prevent sending request to yourself
    if (fromUserId.equals(toUserId)) {
      return res.status(400).json({
        message: "Cannot send connection request to yourself",
      });
    }

    //4. Check whether target user exists
    const toUserExists = await User.findById(toUserId);
    if (!toUserExists) {
      return res.status(404).json({
        message:
          "Connection request can't be sent because this user doesn't exist",
      });
    }

    //If there is an existing Connection Request then we won't send the request
    //I have send the connection once then I shouldn't be able to send the connection request to the same user
    // or If I have recieved the connection request then I also shouldn't able to send the connection request

    // 5. Check whether a request already exists in either direction, whether you have sent the connection or received the connection
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

    //6. Create connection request if connection request doesn't exists
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    console.log(connectionRequest);

    const connectionRequestData = await connectionRequest.save();
    return res.status(200).json({
      message:
        status === "interested"
          ? `${req.user.firstName} is interested and send the connection request to ${toUserExists.firstName}`
          : `${req.user.firstName} is has ignored ${toUserExists.firstName}`,
      connectionRequestData,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error in sending connection request: " + err.message });
  }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  // const status = req.params.status;
  // const requestId = req.params.requestId;
  const { status, requestId } = req.params;
  // In order to accepted or reject the connection request, first I have to retrieve the connection request
  // in connection request collection, I have to search for all those document where user have recieved
  // connection request by making a query in ConnectionRequest collection to find the documents using
  // loggedIn._id and status must be interested
  // ConnectionRequest.find({$or[ {toUserId: loggedIn._id}, status:"interested" ]})
  try {
    const ALLOWED_STATUS = ["accepted", "rejected"];
    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid review status for connection request" });
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    connectionRequest.status = status;
    const updatedConnectionRequest = await connectionRequest.save();
    return res.status(200).json({
      message: `Connection Request : ${updatedConnectionRequest.status}`,
      updatedConnectionRequest,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error in updating the connection request: " + err.message,
    });
  }
});
module.exports = requestRouter;
