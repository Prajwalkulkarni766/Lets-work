const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");
const fetchUser = require("../middleware/fetchUser");

router.use(fetchUser);

router.post("/post",
    body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // const { userId } = req.session;
            const { userId, postContent } = req.body;

            const newPost = await Post({
                user: userId,
                content: postContent,
            });

            await newPost.save();

            const postId = newPost._id;

            res.status(200).json({ mesaage: "Success", postId });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

router.post("/like",
    body("postId").custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return Promise.reject("Enter a valid post id");
        }
        return Promise.resolve();
    }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { postId, userId } = req.body;

            const newLike = await Like({
                post: postId,
                user: userId,
            });

            await newLike.save();

            res.status(200).json({ mesaage: "Success" });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

router.post("/comment",
    body("postId").custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return Promise.reject("Enter a valid post id");
        }
        return Promise.resolve();
    }),
    body("commentContent", "Comment content cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { postId, commentContent, userId } = req.body;

            const newComment = await Comment({
                post: postId,
                user: userId,
                content: commentContent,
            });

            await newComment.save();

            res.status(200).json({ mesaage: "Success" });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

module.exports = router;

// FIX-ME: Remove userId from request and test it with session merging with client-end