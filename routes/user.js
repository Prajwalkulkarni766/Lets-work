const express = require("express")
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require("../models/user");
const fetchUser = require("../middleware/fetchUser");
const upload = require("express-fileupload");
const path = require("path");

router.use(fetchUser);

router.use(upload());

// get user
router.get("/user", async (req, res) => {
    try {
        const { userId } = req.body;

        const getUser = await User.findById(userId);

        res.status(200).json(getUser);
    }
    catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// upload profile image
router.post("/user", async (req, res) => {
    try {

        const { userId } = req.body;

        const getUser = await User.findById(userId);

        if (getUser.profilePic && getUser.profilePic !== "") {
            const currentDirectory = process.cwd();
            const profileImageUrl = path.join(currentDirectory, getUser.profilePic);
            fs.unlinkSync(profileImageUrl);
        }

        const file = req.files.profileImg;

        const uniqueFileName = Date.now() + "-" + file.name;

        const mvFileAsync = (filePath, destination) => {
            return new Promise((resolve, reject) => {
                file.mv(filePath, function (err) {
                    if (err) {
                        console.error("Error uploading file:", err);
                        reject(err);
                    } else {
                        resolve(destination);
                    }
                });
            });
        };

        const destinationPath = await mvFileAsync(path.join("./docs", uniqueFileName));

        const update = { profilePic: "/docs/" + uniqueFileName };

        const updateUser = await User.findByIdAndUpdate(userId, update);

        res.status(200).json({ message: "Profile image uploaded" });

    }
    catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// update the user information
router.put("/user",
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

            const { userName, oldEmail, userEmail, userPassword, userLocation } = req.body;

            const existingUser = await User.find({ email: oldEmail }).select("-_id -__v -joinDate").exec();

            if (existingUser.length > 1) {
                return res.status(400).json({ message: "Another user with email already exists" });
            }
            else if (!existingUser) {
                return res.status(400).json({ message: "User not found" });
            }

            const hashedUserPassword = await bcrypt.hash(userPassword, 10);

            const filter = { email: oldEmail };

            const update = {
                name: userName,
                email: userEmail,
                password: hashedUserPassword,
                location: userLocation
            };

            const updateUser = await User.findOneAndUpdate(filter, update);

            res.status(200).json({ message: "Information updated" });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// delete the user account
router.delete("/user",
    body("userEmail", "Enter a valid email").isEmail(),
    body("userPassword", "Enter a valid password. Password must contain at least 8 and at most 16 characters.").isLength({ min: 8, max: 16 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userEmail, userPassword } = req.body;

            const existingUser = await User.findOne({ email: userEmail }).select("-_id -__v");

            if (!existingUser) {
                return res.status(400).json({ message: "User not found" });
            }

            const passwordMatch = await bcrypt.compare(userPassword, existingUser.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            const deleteUser = await User.findOneAndDelete({ email: userEmail });

            res.status(200).json({ message: "User account successfully deleted" });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;