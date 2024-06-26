const fs = require("fs");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../../models/user/user");
const secreteKey = process.env.JWT_SECRET_KEY;
const { sendSignupNotification } = require("../../utils/notificationSender");
router.post(
  "/signin",
  body("userEmail").isEmail().withMessage("Enter a valid email"),
  body("userPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("Enter a valid password."),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { userEmail, userPassword } = req.body;
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(userPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      const token = jwt.sign({ userId: user._id }, secreteKey, {
        expiresIn: 86400,
      });
      res.cookie("token", token);
      res.status(200).json({ message: "Login successful" });
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
router.post(
  "/signup",
  body("userName").isLength({ min: 1 }).withMessage("Enter a valid name"),
  body("userLocation")
    .isLength({ min: 1 })
    .withMessage("Enter a valid location"),
  body("userEmail").isEmail().withMessage("Enter a valid email"),
  body("userPassword")
    .notEmpty()
    .isLength({ min: 8, max: 16 })
    .withMessage(
      "Password must contain at least one alphabet, one number, and one special symbol and lenght should be between 8 to 16"
    ),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { userName, userEmail, userPassword, userLocation } = req.body;
      const existingUser = await User.findOne({ email: userEmail });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      const newUser = new User({
        name: userName,
        email: userEmail,
        password: hashedPassword,
        location: userLocation,
      });
      await newUser.save();
      const token = jwt.sign({ userId: newUser._id }, secreteKey, {
        expiresIn: 86400,
      });
      res.cookie("token", token);
      res.status(201).json({ message: "Signup successful" });
      await sendSignupNotification(newUser._id, userName);
    } catch (error) {
      console.error("Error: ", error);
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
