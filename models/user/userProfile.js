const { Schema, model } = require("mongoose");
const userProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    headline: { type: String, required: true },
    summary: { type: String, required: true },
    industry: { type: String },
    industryType: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, required: true },
});
const UserProfile = model("UserProfile", userProfileSchema);
module.exports = UserProfile;
