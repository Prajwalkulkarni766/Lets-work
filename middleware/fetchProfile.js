const mongoose = require('mongoose');
const Profile = require("../models/profile");

const fetchProfile = async (req, res, next) => {
    try {
        const { profileId } = req.body;

        if (!profileId) {
            return res.status(400).json({ message: "Provide profile id" });
        }

        if (!mongoose.Types.ObjectId.isValid(profileId)) {
            return res.status(400).json({ message: "Invalid profile id format" });
        }

        const getProfile = await Profile.findById(profileId);

        if (getProfile) {
            next();
        }
        else {
            return res.status(400).json({ message: "Profile not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchProfile;