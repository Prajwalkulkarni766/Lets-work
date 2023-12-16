const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const secreteKey = process.env.JWT_SECRET_KEY;

// Login
router.post(
    "/signin",
    body("userEmail").isEmail().withMessage("Enter a valid email"),
    body("userPassword")
        .isLength({ min: 8, max: 16 })
        .withMessage(
            "Enter a valid password. Password must be between 8 and 16 characters."
        ),
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
            console.error("Error: ", error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

// Signup
router.post(
    "/signup",
    body("userName").isLength({ min: 1 }).withMessage("Enter a valid name"),
    body("userLocation").isLength({ min: 1 }).withMessage("Enter a valid location"),
    body("userEmail").isEmail().withMessage("Enter a valid email"),
    body("userPassword")
        .isLength({ min: 8, max: 16 })
        .withMessage(
            "Enter a valid password. Password must be between 8 and 16 characters."
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
                return res.status(400).json({ message: "User with this email already exists" });
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
        } catch (error) {
            console.error("Error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;