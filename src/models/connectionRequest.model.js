const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not valid connection status`,
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);
module.exports = ConnectionRequest;

/*
  *connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
    Why are we creating this index?
      We create a compound index on fromUserId and toUserId because 
      connection requests are commonly searched using both fields.
      ConnectionRequest.findOne({
        fromUserId,
        toUserId
      });

      Without an index, MongoDB may need to scan many documents to find the matching request. 
      With this index, MongoDB can locate the matching document much faster.



*/
