const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Profile = require("../models/profile");
const fetchUser = require("../middleware/fetchUser");
const fetchProfile = require("../middleware/fetchProfile");
const getUserId = require("../getUserId");

router.use(fetchUser);

// Centralized User ID Retrieval
const getUserIdFromToken = async (req) => {
    return await getUserId(req.header('token'));
};

// Constants for Response Messages
const SUCCESS_MESSAGE = "Success";
const PROFILE_NOT_FOUND_MESSAGE = "Profile not found";
const PROFILE_ALREADY_CREATED_MESSAGE = "Profile already created";
const PROFILE_UPDATED_MESSAGE = "Profile updated";
const PROFILE_DELETED_MESSAGE = "Profile deleted";
const PROFILE_DELETE_ERROR_MESSAGE = "Problem while deleting profile. You might have provided another profile id related to another user or vice versa";

// get profile
router.get("/profile/:id*?", async (req, res) => {
    try {
        let userId;
        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserId(req.header('token'));
        }
        const getProfile = await Profile.find({ user: userId });

        if (getProfile.length > 0) {
            res.status(200).json(getProfile);
        } else {
            res.status(400).json({ message: PROFILE_NOT_FOUND_MESSAGE });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

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

            const userId = await getUserIdFromToken(req);
            const { headline, summary, industry, location, industryType, website } = req.body;

            const findProfile = await Profile.find({ user: userId });

            if (findProfile.length > 0) {
                return res.status(400).json({ message: PROFILE_ALREADY_CREATED_MESSAGE });
            }

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

            if (newProfile._id) {
                res.status(200).json({ message: "Work profile added" });
            } else {
                res.status(200).json({ message: "Problem while adding work profile" });
            }

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

router.use(fetchProfile);

// update existing work profile
router.put("/profile", async (req, res) => {
    try {
        const userId = await getUserIdFromToken(req);
        const { profileId, headline, summary, industry, industryType, website, location } = req.body;
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
            res.status(200).json({ message: PROFILE_UPDATED_MESSAGE });
        } else {
            res.status(400).json({ message: PROFILE_DELETE_ERROR_MESSAGE });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// delete existing work profile
router.delete("/profile", async (req, res) => {
    try {
        const userId = await getUserIdFromToken(req);
        const deleteProfile = await Profile.deleteOne({ user: userId });

        if (deleteProfile.deletedCount == 1) {
            res.status(200).json({ message: PROFILE_DELETED_MESSAGE });
        } else {
            res.status(400).json({ message: PROFILE_DELETE_ERROR_MESSAGE });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;