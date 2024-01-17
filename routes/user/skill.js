const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Skill = require("../../models/user/skill");
const fetchUser = require("../../middleware/user/fetchUser");
const fetchSkill = require("../../middleware/user/fetchSkill");
const getUserId = require("../../utils/getUserId");
router.use(fetchUser);
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
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    const now = new Date();
    const dateString = `${now.getDate()}/${now.getMonth() + 1
      }/${now.getFullYear()}`;
    const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
    fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
      if (err) throw err;
    });
  }
});
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      const now = new Date();
      const dateString = `${now.getDate()}/${now.getMonth() + 1
        }/${now.getFullYear()}`;
      const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
      fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
        if (err) throw err;
      });
    }
  }
);
router.use(fetchSkill);
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      const now = new Date();
      const dateString = `${now.getDate()}/${now.getMonth() + 1
        }/${now.getFullYear()}`;
      const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
      fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
        if (err) throw err;
      });
    }
  }
);
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
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    const now = new Date();
    const dateString = `${now.getDate()}/${now.getMonth() + 1
      }/${now.getFullYear()}`;
    const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
    fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
      if (err) throw err;
    });
  }
});
module.exports = router;
