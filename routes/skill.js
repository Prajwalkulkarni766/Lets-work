const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Skill = require("../models/skill");
const fetchUser = require("../middleware/fetchUser");
const fetchSkill = require("../middleware/fetchSkill");
const getUserId = require("../getUserId");

router.use(fetchUser);

// Centralized User ID Retrieval
const getUserIdFromToken = async (req) => {
    return await getUserId(req.header('token'));
};

// Constants for Response Messages
const SUCCESS_MESSAGE = "Success";
const SKILL_NOT_FOUND_MESSAGE = "Skill not found";
const SKILL_ADDED_MESSAGE = "New skill added";
const SKILL_UPDATE_MESSAGE = "Skills updated";
const SKILL_DELETE_MESSAGE = "Skill deleted";
const SKILL_DELETE_ERROR_MESSAGE = "Problem while updating skill";

// get skills
router.get("/skill/:id*?", async (req, res) => {
    try {
        let userId;
        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserIdFromToken(req);
        }
        const getSkill = await Skill.find({ user: userId });

        if (getSkill.length > 0) {
            res.status(200).json(getSkill);
        } else {
            res.status(400).json({ message: SKILL_NOT_FOUND_MESSAGE });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// add a new skill
router.post("/skill",
    body("name", "Enter valid skill name").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userId = await getUserIdFromToken(req);
            const { name } = req.body;

            const newSkill = await Skill({
                user: userId,
                name: name,
            });

            await newSkill.save();

            if (newSkill._id) {
                res.status(200).json({ message: SKILL_ADDED_MESSAGE });
            } else {
                res.status(200).json({ message: "Problem while adding new skill" });
            }
        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

router.use(fetchSkill);

// update the existing skill
router.put("/skill",
    body("name", "Enter valid skill name").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userId = await getUserIdFromToken(req);
            const { skillId, name } = req.body;

            const filter = { _id: skillId, user: userId };
            const update = { name: name };

            const updateSkill = await Skill.updateOne(filter, update);

            if (updateSkill.modifiedCount == 1) {
                res.status(200).json({ message: SKILL_UPDATE_MESSAGE });
            } else {
                res.status(400).json({ message: "Problem while updating skill" });
            }

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// delete the existing skill
router.delete("/skill", async (req, res) => {
    try {
        const userId = await getUserIdFromToken(req);
        const { skillId } = req.body;

        const deleteSkill = await Skill.deleteOne({ _id: skillId, user: userId });

        if (deleteSkill.deletedCount == 1) {
            res.status(200).json({ message: SKILL_DELETE_MESSAGE });
        } else {
            res.status(400).json({ message: SKILL_DELETE_ERROR_MESSAGE });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;