const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Experience = require("../../models/user/experience");
const fetchUser = require("../../middleware/user/fetchUser");
const getUserId = require("../../utils/getUserId");
const fetchExperience = require("../../middleware/user/fetchExperience");
router.use(fetchUser);
const validateExperienceId = body("experienceId").custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return Promise.reject("Enter a valid experience id");
  }
  return Promise.resolve();
});
const validateAsync = (validator) => async (req, res, next) => {
  await validator(req).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
router.get("/experience/:id*?", async (req, res) => {
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = await getUserId(req.header("token"));
    }
    const getExperience = await Experience.find({ user: userId });
    if (getExperience.length > 0) {
      res.status(200).json(getExperience);
    } else {
      res.status(400).json({ message: "Experience not found" });
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
  "/experience",
  validateAsync(validateExperienceId),
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
      const userId = await getUserId(req.header("token"));
      const { companyName, title, location, startDate, endDate } = req.body;
      const newExperience = await Experience({
        user: userId,
        companyName: companyName,
        title: title,
        location: location,
        startDate: startDate,
        endDate: endDate,
      });
      await newExperience.save();
      if (newExperience._id) {
        res.status(200).json({ message: "Experience added" });
      } else {
        res.status(400).json({ message: "Problem while adding experience" });
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
router.use(fetchExperience);
router.put(
  "/experience",
  validateAsync(validateExperienceId),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const userId = await getUserId(req.header("token"));
      const { experienceId, companyName, title, location, startDate, endDate } =
        req.body;
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
      } else {
        res.status(400).json({ message: "Problem while updating experience" });
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
router.delete(
  "/experience",
  validateAsync(validateExperienceId),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const userId = await getUserId(req.header("token"));
      const { experienceId } = req.body;
      const deleteExperience = await Experience.deleteOne({
        _id: experienceId,
        user: userId,
      });
      if (deleteExperience.deletedCount == 1) {
        res.status(200).json({ message: "Experience deleted" });
      } else {
        res.status(400).json({ message: "Problme while deleting experience" });
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
module.exports = router;
