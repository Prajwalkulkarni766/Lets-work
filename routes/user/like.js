const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Like = require("../../models/user/like");
const mongoose = require("mongoose");
const fetchUser = require("../../middleware/user/fetchUser");
const fetchPost = require("../../middleware/user/fetchPost");
const getUserId = require("../../utils/getUserId");
const { sendLikeNotification } = require("../../utils/notificationSender");

router.use(fetchUser);
router.use(fetchPost);

// Add a like
router.post("/like", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
      return res.status(400).json({ message: "Enter a valid post id" });
    }
    const userId = await getUserId(req.header("token"));
    const { postId } = req.body;

    const oldLike = await Like.findOne({ post: postId, user: userId });

    if (oldLike) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    const newLike = await Like.create({
      post: postId,
      user: userId,
    });

    res.status(200).json({ message: "Success" });

    await sendLikeNotification(userId, postId);
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Remove the like
router.delete("/like", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
      return res.status(400).json({ message: "Enter a valid post id" });
    }
    const userId = await getUserId(req.header("token"));
    const { postId } = req.body;

    const getLike = await Like.findOne({ post: postId, user: userId });

    if (!getLike) {
      return res.status(400).json({ message: "You don't liked this post yet. To remove the like first of all like the post" });
    }

    await Like.findByIdAndDelete(getLike._id);

    res.status(200).json({ message: "Like removed" });
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
