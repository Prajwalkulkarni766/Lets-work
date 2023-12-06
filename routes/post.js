const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");
const fetchUser = require("../middleware/fetchUser");
const fetchPost = require("../middleware/fetchPost");
const upload = require("express-fileupload");
const path = require("path");

router.use(fetchUser);

router.use(upload());

// add a post
// router.post("/post",
//     body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
//     async (req, res) => {
//         try {
//             const errors = validationResult(req);

//             if (!errors.isEmpty()) {
//                 return res.status(400).json({ errors: errors.array() });
//             }

//             let imagePath = "";

//             if (req.files && req.files.image) {

//                 const file = req.files.image;

//                 const uniqueFileName = Date.now() + "-" + file.name;

//                 const mvFileAsync = (filePath, destination) => {
//                     return new Promise((resolve, reject) => {
//                         file.mv(filePath, function (err) {
//                             if (err) {
//                                 console.error("Error uploading file:", err);
//                                 reject(err);
//                             } else {
//                                 resolve(destination);
//                             }
//                         });
//                     });
//                 };

//                 imagePath = await mvFileAsync(path.join("./docs", uniqueFileName))
//                     .catch((err) => {
//                         throw new Error(err.message || "File upload failed");
//                     });
//             }

//             const { userId, postContent } = req.body;

//             console.log(imagePath)

//             const newPost = await Post({
//                 user: userId,
//                 image: imagePath || undefined,
//                 content: postContent,
//             });

//             await newPost.save();

//             const postId = newPost._id;

//             res.status(200).json({ message: "Success", postId });
//         }
//         catch (e) {
//             console.error("error => ", e);
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     });


router.post("/post",
    body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let imagePath = "";

            if (req.files && req.files.image) {
                const file = req.files.image;

                const uniqueFileName = Date.now() + "-" + file.name;

                const mvFileAsync = (filePath, destination) => {
                    return new Promise((resolve, reject) => {
                        file.mv(filePath, function (err) {
                            if (err) {
                                console.error("Error uploading file:", err);
                                reject(new Error("File upload failed"));
                            } else {
                                resolve(destination);
                            }
                        });
                    });
                };

                try {
                    await mvFileAsync(path.join("./docs", uniqueFileName));
                    imagePath = "/docs/" + uniqueFileName;
                } catch (err) {
                    console.error("Error uploading file:", err);
                    throw new Error("File upload failed");
                }
            }

            const { userId, postContent } = req.body;

            const newPost = await Post.create({
                user: userId,
                image: imagePath || undefined,
                content: postContent,
            });

            const postId = newPost._id;

            res.status(200).json({ message: "Success", postId });
            
        } catch (e) {
            console.error("Error:", e);
            return res.status(500).json({ message: e.message || "Internal server error" });
        }
    });



router.use(fetchPost);

// update the post
router.put("/post",
    body("postContent", "Post content cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId, postId, postContent } = req.body;

            const updatePost = await Post.findOneAndUpdate({ _id: postId, user: userId }, { content: postContent })

            if (updatePost) {
                res.status(200).json({ message: "Updated post" });
            }
            else {
                res.status(400).json({ message: "Problem while updating post" });
            }

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// delete the post
router.delete("/post", async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { postId, userId } = req.body;

        const deletePost = await Post.findOneAndDelete({ _id: postId, user: userId });
        const deleteLike = await Like.deleteMany({ post: postId });
        const deleteComment = await Comment.deleteMany({ post: postId });

        if (deletePost) {
            res.status(200).json({ message: "Post deleted successfully" });
        }
        else {
            return res.status(400).json({ message: "Problem while deleting post" });
        }
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// add a like
router.post("/like", async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { postId, userId } = req.body;

        const oldLike = await Like.find({ post: postId, user: userId });

        if (oldLike.length > 0) {
            return res.status(400).json({ message: "You have already liked this post" })
        }

        const newLike = await Like({
            post: postId,
            user: userId,
        });

        await newLike.save();

        res.status(200).json({ message: "Success" });
    }
    catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// remove the like
router.delete("/like", async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { postId, userId } = req.body;

        const getLike = await Like.find({ post: postId, user: userId });

        if (getLike.length == 0) {
            return res.status(400).json({ message: "You don't liked this post yet. To remove the like first of all like the post" });
        }

        const id = getLike[0]._id;

        const deleteLike = await Like.findByIdAndDelete(id);

        res.status(200).json({ message: "Like removed" });
    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// add a comment
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

            res.status(200).json({ message: "Success" });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// remove the comment
router.delete("/comment",
    body("commentId").custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return Promise.reject("Enter a valid comment id");
        }
        return Promise.resolve();
    }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { commentId, userId } = req.body;

            const getComment = await Comment.find({ _id: commentId, user: userId });

            if (!getComment) {
                return res.status(400).json({ message: "Comment not found" });
            }
            else if (getComment[0].user != userId) {
                return res.status(400).json({ message: "You don't have right to delete someone else's comment" });
            }

            const deleteComment = await Comment.findByIdAndDelete(commentId);

            res.status(200).json({ message: "Comment deleted" })

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;