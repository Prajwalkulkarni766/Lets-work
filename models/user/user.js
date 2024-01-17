const { Schema, model } = require("mongoose");
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    location: { type: String },
    joinDate: { type: Date, default: Date.now },
});
const User = model("User", userSchema);
module.exports = User;