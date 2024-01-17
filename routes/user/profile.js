const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Profile = require("../../models/user/userProfile");
const fetchUser = require("../../middleware/user/fetchUser");
const fetchProfile = require("../../middleware/user/fetchProfile");
const getUserId = require("../../utils/getUserId");
router.use(fetchUser);
router.get("/profile/:id*?", async (req, res) => {
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = await getUserId(req.header("token"));
    }
    const getProfile = await Profile.find({ user: userId });
    if (getProfile.length > 0) {
      res.status(200).json(getProfile);
    } else {
      res.status(400).json({ message: "Profile not found" });
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
      const userId = await getUserId(req.header('token'));
      const { headline, summary, industry, location, industryType, website } =
        req.body;
      const findProfile = await Profile.find({ user: userId });
      if (findProfile.length > 0) {
        return res
          .status(400)
          .json({ message: "Profile already created" });
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
        res.status(400).json({ message: "Problem while adding work profile" });
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
router.use(fetchProfile);
router.put("/profile", async (req, res) => {
  try {
    const userId = await getUserId(req.header('token'));
    const { profileId, headline, summary, industry, industryType, website, location, } = req.body;
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
    } else {
      res.status(400).json({ message: "Problem while deleting profile. You might have provided another profile id related to another user or vice versa" });
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
router.delete("/profile", async (req, res) => {
  try {
    const userId = await getUserId(req.header('token'));
    const deleteProfile = await Profile.deleteOne({ user: userId });
    if (deleteProfile.deletedCount == 1) {
      res.status(200).json({ message: "Profile deleted" });
    } else {
      res.status(400).json({ message: "Problem while deleting profile. You might have provided another profile id related to another user or vice versa" });
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
