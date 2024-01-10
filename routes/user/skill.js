const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Skill = require("../../models/user/skill");
const fetchUser = require("../../middleware/user/fetchUser");
const fetchSkill = require("../../middleware/user/fetchSkill");
const getUserId = require("../../utils/getUserId");

router.use(fetchUser);

// get skills
router.get("/skill/:id*?", async (req, res) => {
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = await getUserId(req.header('token'));
    }
    const getSkill = await Skill.find({ user: userId });

    if (getSkill.length > 0) {
      res.status(200).json(getSkill);
    } else {
      res.status(400).json({ message: "Skill not found" });
    }
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// add a new skill
router.post(
  "/skill",
  body("name", "Enter valid skill name").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = await getUserId(req.header('token'));
      const { name } = req.body;

      const newSkill = await Skill({
        user: userId,
        name: name,
      });

      await newSkill.save();

      if (newSkill._id) {
        res.status(200).json({ message: "New skill added" });
      } else {
        res.status(400).json({ message: "Problem while adding new skill" });
      }
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.use(fetchSkill);

// update the existing skill
router.put(
  "/skill",
  body("name", "Enter valid skill name").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = await getUserId(req.header('token'));
      const { skillId, name } = req.body;

      const filter = { _id: skillId, user: userId };
      const update = { name: name };

      const updateSkill = await Skill.updateOne(filter, update);

      if (updateSkill.modifiedCount == 1) {
        res.status(200).json({ message: "Skills updated" });
      } else {
        res.status(400).json({ message: "Problem while updating skill" });
      }
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// delete the existing skill
router.delete("/skill", async (req, res) => {
  try {
    const userId = await getUserId(req.header('token'));
    const { skillId } = req.body;

    const deleteSkill = await Skill.deleteOne({ _id: skillId, user: userId });

    if (deleteSkill.deletedCount == 1) {
      res.status(200).json({ message:"Skill deleted" });
    } else {
      res.status(400).json({ message: "Problem while updating skill" });
    }
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
