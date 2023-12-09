const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Like = require("../models/like");
const mongoose = require('mongoose');
const fetchUser = require("../middleware/fetchUser");
const fetchPost = require("../middleware/fetchPost");
const getUserId = require("../getUserId");

router.use(fetchUser);
router.use(fetchPost);

// Constants for Validation Messages
const VALID_POST_ID_MESSAGE = "Enter a valid post id";
const LIKE_ALREADY_EXISTS_MESSAGE = "You have already liked this post";
const LIKE_NOT_FOUND_MESSAGE = "You don't liked this post yet. To remove the like first of all like the post";
const LIKE_REMOVED_MESSAGE = "Like removed";
const SUCCESS_MESSAGE = "Success";

// Validation middleware
const validatePostId = body("postId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return Promise.reject(VALID_POST_ID_MESSAGE);
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

// Add a like
router.post("/like",
    validateAsync(validatePostId),
    async (req, res) => {
        try {
            const userId = await getUserId(req.header('token'));
            const { postId } = req.body;

            const oldLike = await Like.findOne({ post: postId, user: userId });

            if (oldLike) {
                return res.status(400).json({ message: LIKE_ALREADY_EXISTS_MESSAGE });
            }

            const newLike = await Like.create({
                post: postId,
                user: userId,
            });

            res.status(200).json({ message: SUCCESS_MESSAGE });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// Remove the like
router.delete("/like",
    validateAsync(validatePostId),
    async (req, res) => {
        try {
            const userId = await getUserId(req.header('token'));
            const { postId } = req.body;

            const getLike = await Like.findOne({ post: postId, user: userId });

            if (!getLike) {
                return res.status(400).json({ message: LIKE_NOT_FOUND_MESSAGE });
            }

            await Like.findByIdAndDelete(getLike._id);

            res.status(200).json({ message: LIKE_REMOVED_MESSAGE });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;