const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const connectToMongoose = async () => {
    try {
        await mongoose.connect(`${MONGO_URI}`);
        console.log("Connected");
    }
    catch (e) {
        console.log("Not connected", e);
    }
}

module.exports = connectToMongoose;