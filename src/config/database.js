const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sanjeet_db:mkLbH7SPjzMxX5i6@connecttoprofessional.tfs2df4.mongodb.net/",
  );
};

module.exports = connectDB;
