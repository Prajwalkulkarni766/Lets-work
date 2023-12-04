const mongoose = require('mongoose');
const Post = require("../models/post");

const fetchPost = async (req, res, next) => {
    try {
        const { postId } = req.body;

        if (!postId) {
            return res.status(400).json({ message: "Provide post id" });
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post id format" });
        }

        const getPost = await Post.findById(postId);

        if (getPost) {
            next();
        }
        else {
            return res.status(400).json({ message: "Post not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchPost;