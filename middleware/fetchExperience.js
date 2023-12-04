const mongoose = require('mongoose');
const Experience = require("../models/experience");

const fetchExperience = async (req, res, next) => {
    try {
        const { experienceId } = req.body;

        if (!experienceId) {
            return res.status(400).json({ message: "Provide experience id" });
        }

        if (!mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({ message: "Invalid experience id format" });
        }

        const getExperience = await Experience.findById(experienceId);

        if (getExperience) {
            next();
        }
        else {
            return res.status(400).json({ message: "Experience not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchExperience;