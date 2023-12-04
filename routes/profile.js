const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Profile = require("../models/profile");
const fetchUser = require("../middleware/fetchUser");
const fetchProfile = require("../middleware/fetchProfile");

router.use(fetchUser);

// create a new work profile
router.post("/profile",
    body("headline", "Headline cannot be empty").isLength({ min: 1 }),
    body("summary", "Summary cannot be empty").isLength({ min: 1 }),
    body("industry", "Industry cannot be empty").isLength({ min: 1 }),
    body("location", "Location cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId, headline, summary, industry, location, industryType, website } = req.body;

            const newProfile = await Profile({
                user: userId,
                headline: headline,
                summary: summary,
                industry: industry,
                industryType: industryType || undefined,
                website: website || undefined,
                location: location,
            });

            await newProfile.save();

            res.status(200).json({ message: "Work profile added" });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

router.use(fetchProfile);

// update existing work profile
router.put("/profile", async (req, res) => {
    try {

        const { userId, profileId, headline, summary, industry, industryType, website, location } = req.body;

        const filter = { _id: profileId, user: userId };

        const update = {
            headline: headline || undefined,
            summary: summary || undefined,
            industry: industry || undefined,
            industryType: industryType || undefined,
            website: website || undefined,
            location: location || undefined,
        };

        const updateProfile = await Profile.updateOne(filter, update);

        if (updateProfile.modifiedCount == 1) {
            res.status(200).json({ message: "Profile updated" });
        }
        else {
            res.status(400).json({ message: "Problem while updating profile. You might have provided another profile id related with another user or vice versa" });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// delete existing work profile
router.delete("/profile", async (req, res) => {
    try {
        const { userId, profileId } = req.body;

        const deletePorfile = await Profile.deleteOne({ user: userId, _id: profileId });

        if (deletePorfile.deletedCount == 1) {
            res.status(200).json({ message: "Profile deleted" });
        }
        else {
            res.status(400).json({ message: "Problem while deleting profile. You might have provided another profile id related with another user or vice versa" });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;