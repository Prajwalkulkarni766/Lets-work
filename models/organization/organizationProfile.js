const { Schema, model } = require("mongoose");

const organizationProfileSchema = new Schema({
    organization: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    industry: { type: String , required: true},
    description: { type: String, required: true },
    location: { type: String, required: true },
});

const OrganizationProfile = model("OrganizationProfile", organizationProfileSchema);
module.exports = OrganizationProfile;
