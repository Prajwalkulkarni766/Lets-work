const express = require("express");
const fs = require("fs");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Comment = require("../../models/user/comment");
const fetchUser = require("../../middleware/user/fetchUser");
const fetchPost = require("../../middleware/user/fetchPost");
const getUserId = require("../../utils/getUserId");
router.use(fetchUser);
router.use(fetchPost);
router.get("/comment", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        const { postId } = req.body;
        const comments = await Comment.find({ post: postId });
        res.status(200).json(comments);
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
router.post("/comment", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = await getUserId(req.header("token"));
        const { postId, commentContent } = req.body;
        const newComment = await new Comment({
            post: postId,
            user: userId,
            content: commentContent,
        }).save();
        if (newComment._id) {
            res.status(200).json({ message: "Success", commentId: newComment._id });
        } else {
            res.status(400).json({ message: "Problem while adding comment" });
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
router.delete("/comment", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.commentId)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = await getUserId(req.header("token"));
        const { commentId } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        } else if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You cannot delete someone else's comment" });
        }
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted" });
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