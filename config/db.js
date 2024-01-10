const mongoose = require("mongoose");
const dotenvConfig = require("../config/dotenv");

const connectToMongoose = async () => {
  try {
    await mongoose.connect(`${dotenvConfig.MONGO_URI}`);
    console.log("Connected");
  } catch (e) {
    console.log("Not connected", e);
  }
};

module.exports = connectToMongoose;
