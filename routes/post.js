const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");
const fetchUser = require("../middleware/fetchUser");
const fetchPost = require("../middleware/fetchPost");
const upload = require("express-fileupload");
const path = require("path");
const getUserId = require("../getUserId");
const fs = require("fs");

router.use(fetchUser);

// to get post
router.get("/post/(:startDate&:endDate)?&:count", async (req, res) => {
  try {

    const userId = await getUserId(req.header("token"));

    if (req.params.startDate && req.params.endDate) {
      var startDate = new Date(req.params.startDate);
      var endDate = new Date(req.params.endDate);
    }
    else {
      var startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date();
    }

    let count = req.params.count;
    let posts;
    let index = 0;

    while (true) {
      posts = await Post.find({
        postDate: { $gte: startDate, $lt: endDate },
      })
        .sort({ _id: -1 })
        .skip(count)
        .limit(10)
        .lean();
      if (posts.length > 0 || index == 5) {
        break;
      } else {
        count = 0;
        temp = startDate;
        endDate = new Date(`${temp}`);
        startDate.setDate(startDate.getDate() - 1);
        console.log(`checking from date : ${startDate} and to date : ${endDate}`);
        index++;
      }
    }

    res.json({ startDate, endDate, posts });

  } catch (e) {
    console.error("Error:", e);
    return res
      .status(500)
      .json({ message: e.message || "Internal server error" });
  }
});

router.use(upload());

const deletePostTransaction = async (postId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletePost = await Post.findOneAndDelete(
      { _id: postId, user: userId },
      { session }
    );
    await Like.deleteMany({ post: postId }, { session });
    await Comment.deleteMany({ post: postId }, { session });

    await session.commitTransaction();
    return deletePost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Centralized File Upload Logic
const uploadFile = async (file, destinationPath) => {
  const uniqueFileName = Date.now() + "-" + file.name;

  await new Promise((resolve, reject) => {
    file.mv(path.join("./docs", uniqueFileName), (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        reject(new Error("File upload failed"));
      } else {
        resolve();
      }
    });
  });

  return "/docs/" + uniqueFileName;
};

// Create Post
router.post(
  "/post",
  body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let imagePath = "";
      if (req.files && req.files.image) {
        imagePath = await uploadFile(req.files.image, "./docs");
      }

      const userId = await getUserId(req.header("token"));
      const { postContent } = req.body;

      const newPost = await Post.create({
        user: userId,
        image: imagePath || undefined,
        content: postContent,
      });

      if (newPost._id) {
        res.status(200).json({ message: "Success", postId: newPost._id });
      } else {
        res.status(200).json({ message: "Problem while uploading post" });
      }
    } catch (e) {
      console.error("Error:", e);
      return res
        .status(500)
        .json({ message: e.message || "Internal server error" });
    }
  }
);

// router.use(fetchPost);

// repost the post
router.post("/repost", async (req, res) => {
  try {
    const userId = await getUserId(req.header("token"));
    const { postId } = req.body;

    const findPost = await Post.findById(postId);

    if (!findPost) {
      return res.status(400).json({ message: "Post not found" });
    }

    console.log(findPost);

    const newPost = await Post.create({
      user: userId,
      image: findPost.imagePath || undefined,
      content: findPost.content,
    });

    if (newPost._id) {
      res.status(200).json({ message: "Reposted post" });
    } else {
      res.status(400).json({ message: "Problem while reposting the post" });
    }
  } catch (e) {
    console.log("Error:", e);
    return res
      .status(500)
      .json({ message: e.message || "Internal server error" });
  }
});

// Update Post
router.put(
  "/post",
  body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = await getUserId(req.header("token"));
      const { postId, postContent } = req.body;

      const getPost = await Post.findOne({ _id: postId, user: userId });

      if (!getPost) {
        return res.status(400).json({ message: "Post not found" });
      }

      if (getPost.image && getPost.image !== "") {
        const currentDirectory = process.cwd();
        const profileImageUrl = path.join(currentDirectory, getPost.image);
        fs.unlinkSync(profileImageUrl);
      }

      let imagePath = "";
      if (req.files && req.files.image) {
        imagePath = await uploadFile(req.files.image, "./docs");
      }

      const updatePost = await Post.findByIdAndUpdate(postId, {
        content: postContent,
        image: imagePath || undefined,
      });

      if (updatePost) {
        res.status(200).json({ message: "Updated post" });
      } else {
        res.status(400).json({ message: "Problem while updating post" });
      }
    } catch (e) {
      console.error("error => ", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete Post
router.delete("/post", async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = await getUserId(req.header("token"));
    const { postId } = req.body;

    const deletePost = await deletePostTransaction(postId, userId);

    if (deletePost) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      return res.status(400).json({ message: "Problem while deleting post" });
    }
  } catch (e) {
    console.error("error => ", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;