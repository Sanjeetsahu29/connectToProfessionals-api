const express = require("express");
const app = express();
const port = 3000;
const connectDB = require("./config/database");

connectDB()
  .then(() => {
    console.log("Connected to the database");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database", err.errorResponse.errmsg);
  });
