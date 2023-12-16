const express = require("express")
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require("../models/user");
const fetchUser = require("../middleware/fetchUser");
const upload = require("express-fileupload");
const path = require("path");
const getUserId = require("../getUserId");

router.use(fetchUser);

router.use(upload());

// Centralized User ID Retrieval
const getUserIdFromToken = async (req) => {
    return await getUserId(req.header('token'));
};

// Constants for Response Messages
const SUCCESS_MESSAGE = "Success";
const USER_NOT_FOUND_MESSAGE = "User not found";
const INVALID_AUTHORIZATION_MESSAGE = "Invalid user authorization";
const PROFILE_IMAGE_UPLOADED_MESSAGE = "Profile image uploaded";
const INFORMATION_UPDATED_MESSAGE = "Information updated";
const PROBLEM_UPDATE_USER_MESSAGE = "Problem while updating user";
const USER_DELETED_MESSAGE = "User account successfully deleted";
const PROBLEM_DELETE_USER_MESSAGE = "Problem while deleting user account";
const INCORRECT_PASSWORD_MESSAGE = "Incorrect password";

// get user
router.get("/user/:id*?", async (req, res) => {
    try {
        let userId;
        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserIdFromToken(req);
        }
        const getUser = await User.findById(userId);

        if (getUser) {
            res.status(200).json(getUser);
        } else {
            res.status(400).json({ message: USER_NOT_FOUND_MESSAGE });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// upload profile image
router.post("/user", async (req, res) => {
    try {
        const userId = await getUserIdFromToken(req);
        const getUser = await User.findById(userId);

        if (getUser.profilePic && getUser.profilePic !== "") {
            const currentDirectory = process.cwd();
            const profileImageUrl = path.join(currentDirectory, getUser.profilePic);
            fs.unlinkSync(profileImageUrl);
        }

        const file = req.files.profileImg;

        if (!file) {
            return res.status(400).json({ message: "No profile image provided" });
        }

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

        res.status(200).json({ message: PROFILE_IMAGE_UPLOADED_MESSAGE });

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// update the user information
router.put("/user", async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = await getUserId(req.header('token'));

        const { userName, oldEmail, userEmail, userPassword, userLocation } = req.body;

        const existingUser = await User.findOne({ email: oldEmail }).select("-_id -__v -joinDate").exec();

        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }

        if (userId && existingUser._id && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: "Invalid user authorization" });
        }

        const hashedUserPassword = userPassword
            ? await bcrypt.hash(userPassword.toString(), 10)
            : undefined;


        const filter = { email: oldEmail };

        const update = {
            name: userName || undefined,
            email: userEmail || undefined,
            password: hashedUserPassword || undefined,
            location: userLocation || undefined,
        };

        const updateUser = await User.findOneAndUpdate(filter, update);

        if (updateUser) {
            res.status(200).json({ message: INFORMATION_UPDATED_MESSAGE });
        } else {
            res.status(400).json({ message: PROBLEM_UPDATE_USER_MESSAGE });
        }

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
            const existingUser = await User.findOne({ email: userEmail }).select("-_id -__v -joinDate");

            if (!existingUser) {
                return res.status(400).json({ message: USER_NOT_FOUND_MESSAGE });
            }

            const passwordMatch = await bcrypt.compare(userPassword, existingUser.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: INCORRECT_PASSWORD_MESSAGE });
            }

            const deleteUser = await User.findOneAndDelete({ email: userEmail });

            if (deleteUser) {
                res.status(200).json({ message: USER_DELETED_MESSAGE });
            } else {
                res.status(400).json({ message: PROBLEM_DELETE_USER_MESSAGE });
            }

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });


module.exports = router;