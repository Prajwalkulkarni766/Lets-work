const express = require("express")
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require("../models/user");
const secreteKey = process.env.JWT_SECRET_KEY;

// sign in
router.post("/signin",
    body("userEmail", "Enter a valid email").isEmail(),
    body("userPassword", "Enter a valid password. Password must contain at least 8 and at most 16 characters.").isLength({ min: 8, max: 16 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userEmail, userPassword } = req.body;

            const existingUser = await User.findOne({ email: userEmail });

            if (!existingUser) {
                return res.status(400).json({ message: "User not found" });
            }

            const passwordMatch = await bcrypt.compare(userPassword, existingUser.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            const authToken = jwt.sign({ userId: existingUser._id }, secreteKey, {
                expiresIn: 86400
            });

            res.cookie('token', authToken);

            res.status(200).json({ message: "Success" });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// sign up
router.post("/signup",
    body("userName", "Enter a valid name").isLength({ min: 1 }),
    body("userLocation", "Enter a valid location").isLength({ min: 1 }),
    body("userEmail", "Enter a valid email").isEmail(),
    body("userPassword", "Enter a valid password. Password must contain at least 8 and at most 16 characters.").isLength({ min: 8, max: 16 }),
    async (req, res) => {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userName, userEmail, userPassword, userLocation } = req.body;

            const existingUser = await User.findOne({ email: userEmail });

            if (existingUser) {
                return res.status(400).json({ message: "User with this email id already exists" });
            }

            const hashedUserPassword = await bcrypt.hash(userPassword, 10);

            const newUser = await User({
                name: userName,
                email: userEmail,
                password: hashedUserPassword,
                location: userLocation,
            });

            await newUser.save();

            const newUserId = newUser._id;

            const authToken = jwt.sign({ userId: newUserId }, secreteKey, {
                expiresIn: 86400
            });

            res.cookie('token', authToken);

            res.status(201).json({ message: "Success" });
        } catch (e) {
            console.error("error => ", e);
            res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;