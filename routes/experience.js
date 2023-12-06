const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Experience = require("../models/experience");
const fetchUser = require("../middleware/fetchUser");

router.use(fetchUser);

// get experience
router.get("/experience", async (req, res) => {
    try {
        const getExperience = await Experience.find({ user: req.body.userId });

        if (getExperience.length > 0) {
            res.status(200).json(getExperience);
        }
        else {
            res.status(400).json({ message: "Experience not found" });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// add a new experience
router.post("/experience",
    body("companyName", "Enter valid company name").isLength({ min: 1 }),
    body("title", "Enter valid job title").isLength({ min: 1 }),
    body("location", "Enter valid job location").isLength({ min: 1 }),
    body("startDate", "Enter valid job joining date").isDate(),
    body("endDate", "Enter valid job left date").isDate(),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { userId, companyName, title, location, startDate, endDate } = req.body;

            const newExperience = await Experience({
                user: userId,
                companyName: companyName,
                title: title,
                location: location,
                startDate: startDate,
                endDate: endDate,
            });

            await newExperience.save();

            res.status(200).json({ message: "Experience added" });
        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// update the existing experience
router.put("/experience", async (req, res) => {
    try {

        const { experienceId, userId, companyName, title, location, startDate, endDate } = req.body;

        const filter = { _id: experienceId, user: userId };

        const update = {
            companyName: companyName || undefined,
            title: title || undefined,
            location: location || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        const updateExperience = await Experience.updateOne(filter, update);

        if (updateExperience.modifiedCount == 1) {
            res.status(200).json({ message: "Experience updated" });
        }
        else {
            res.status(400).json({ message: "Problem while updating experience" });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// delete the existing experience
router.delete("/experience", async (req, res) => {
    try {

        const { experienceId, userId } = req.body;

        const deleteExperience = await Experience.deleteOne({ _id: experienceId, user: userId });

        if (deleteExperience.deletedCount == 1) {
            res.status(200).json({ message: "Experience deleted" });
        }
        else {
            res.status(200).json({ message: "Problme while deleting experience" });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;