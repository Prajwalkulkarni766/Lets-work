const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Experience = require("../models/experience");
const fetchUser = require("../middleware/fetchUser");
const getUserId = require("../getUserId");
const fetchExperience = require("../middleware/fetchExperience");

router.use(fetchUser);

// Constants for Validation Messages
const VALIDATION_ERROR_MESSAGE = "Enter a valid experience id";

// Validation middleware
const validateExperienceId = body("experienceId").custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return Promise.reject(VALIDATION_ERROR_MESSAGE);
  }
  return Promise.resolve();
});

// Async variant of validation middleware
const validateAsync = (validator) => async (req, res, next) => {
  await validator(req).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get experience
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
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new experience
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
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.use(fetchExperience);

// Update the existing experience
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
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete the existing experience
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
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
