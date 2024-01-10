const mongoose = require('mongoose');
const Skill = require("../../models/user/skill");

const fetchSkill = async (req, res, next) => {
    try {
        const { skillId } = req.body;

        if (!skillId) {
            return res.status(400).json({ message: "Provide skill id" });
        }

        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({ message: "Invalid skill id format" });
        }

        const getSkill = await Skill.findById(skillId);

        if (getSkill) {
            next();
        }
        else {
            return res.status(400).json({ message: "Skill not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchSkill;