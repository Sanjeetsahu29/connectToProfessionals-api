const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/user.model");

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
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "gender",
        "age",
        "about",
        "profilePhoto",
        // "skills",
        // "interests",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "gender",
        "age",
        "about",
        "profilePhoto",
      ]);

    const friends = connections.map((connection) => {
      if (connection.fromUserId._id.equals(loggedInUser._id)) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });
    return res
      .status(200)
      .json({ message: `You have ${friends.length} connections`, friends });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error finding user connections " + error.message });
  }
});

// get all the pending connection request received from the users
userRouter.get("/connections/received/:status", userAuth, async (req, res) => {
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
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "gender",
      "age",
      "about",
      "profilePhoto",
    ]);
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
          ? `You have received ${recievedConnectionRequests.length} connection request`
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

    const sentConnections = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status,
    }).populate("toUserId", [
      "firstName",
      "lastName",
      "gender",
      "age",
      "about",
      "profilePhoto",
    ]);
    // console.log(sentConnections);
    if (sentConnections.length === 0) {
      if (status === "interested") {
        return res.status(200).json({
          message:
            "You don't have any pending connection requests that you've sent.",
        });
      } else {
        return res.status(200).json({
          message: "You have no sent connection requests that were rejected",
        });
      }
    }
    return res.status(200).json({
      message:
        status === "interested"
          ? `You have ${sentConnections.length} pending sent connection request${
              sentConnections.length > 1 ? "s" : ""
            }`
          : `You have ${sentConnections.length} sent connection request${
              sentConnections.length > 1 ? "s" : ""
            } that were rejected`,
      sentConnections,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error finding the sent connection requests : " + err.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;

    // Find all connection requests involving the logged-in user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Store all users who should NOT appear in the feed
    const hideUserFromFeed = new Set();

    connectionRequests.forEach((connection) => {
      hideUserFromFeed.add(connection.fromUserId.toString());
      hideUserFromFeed.add(connection.toUserId.toString());
    });
    console.log(hideUserFromFeed);
    // Don't show the logged-in user himself
    hideUserFromFeed.add(loggedInUser._id.toString());

    // Find users who are not in the hidden-user list
    const feedUsers = await User.find({
      _id: {
        $nin: Array.from(hideUserFromFeed),
      },
    })
      .select(
        "firstName lastName gender age about profilePhoto skills interests",
      )
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Feed users fetched successfully",
      feedUsers,
      // hideUserFromFeed: [...hideUserFromFeed],
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error fetching feed users: " + error.message,
    });
  }
});

/**
 * Build a pagination feature in the feed section 
    /feed?page=1&limit=10 => 1-10 skip(0) limit(10)
    /feed?page=2&limit=10 => 11-20 skip(10) limit(10)
    /feed?page=3&limit=10 => 21-30 skip(0) limit(10)
    /feed?page=4&limit=10 => 31-40 skip(10) limit(10)

    argument logic in skip function => (page-1)*10
 */

module.exports = userRouter;
