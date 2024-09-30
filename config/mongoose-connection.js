const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
    console.log("connected to database");
  })
  .catch(function (err) {
    console.log(err);
  });
 

let db = mongoose.connection;
module.exports = db;
