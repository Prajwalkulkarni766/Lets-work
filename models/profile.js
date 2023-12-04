const { Schema, model, default: mongoose } = require("mongoose");

const profileSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    headline: { type: String, required: true },
    summary: { type: String, required: true },
    industry: { type: String, required: true },
    industryType: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, required: true },
});

const Profile = model("Profile", profileSchema);
module.exports = Profile;
