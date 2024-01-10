const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
};