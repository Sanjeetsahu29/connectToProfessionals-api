const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.model");

// user should be able to see all his connections means requests which is accepted => /connections
// user should also see all the connections that have sent and recieved

/*
 * /connections => view all connections that was accepted
 * /connection/sent/interested => view all connection requests that was sent from the user
 * /connection/sent/rejected => view all connection requests that was rejected by the users
 */
userRouter.get("/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    });
    return res
      .status(200)
      .json({ message: "All connection fetched successfully", connections });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error finding user connections " + error.message });
  }
});

// get all the pending connection request received from the users
userRouter.get("/connections/recieved/:status", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status } = req.params;

    const ALLOWED_STATUS = ["interested", "rejected"];

    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid connection request status" + status });
    }

    const recievedConnectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status,
    });
    if (recievedConnectionRequests.length === 0) {
      if (status === "interested") {
        return res
          .status(200)
          .json({ message: "You don't have any connection requests" });
      } else {
        return res
          .status(400)
          .json({ message: "You don't have rejected any connection request" });
      }
    }

    res.status(200).json({
      message:
        status === "interested"
          ? `You have recieved ${recievedConnectionRequests.length} connection request`
          : `You have rejected ${recievedConnectionRequests.length} connection requests`,
      recievedConnectionRequests,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error finding connection request : " + err.message });
  }
});
// user should be able to view all the connection requests which is in pending or rejected ir accepted then that user is friend of the loggedInUser
userRouter.get("/connection/sent/:status", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const status = req.params.status;
    const ALLOWED_STATUS = ["interested", "rejected"];

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(200).json({ message: "Invalid connection request" });
    }

    const fetchedConnections = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status,
    });
    console.log(fetchedConnections);
    if (fetchedConnections.length === 0) {
      if (status === "interested") {
        return res
          .status(200)
          .json({
            message: "You have not sent any pending connection requests",
          });
      } else {
        return res.status(200).json({
          message:
            "You don't have sent any connections requests that were rejected",
        });
      }
    }
    return res.status(200).json({
      message:
        status === "interested"
          ? `You have ${fetchedConnections.length} pending sent connection request${
              fetchedConnections.length > 1 ? "s" : ""
            }`
          : `You have ${fetchedConnections.length} sent connection request${
              fetchedConnections.length > 1 ? "s" : ""
            } that were rejected`,
      fetchedConnections,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error finding the sent connection requests : " + err.message,
    });
  }
});

module.exports = userRouter;
