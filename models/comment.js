const { Schema, model, default: mongoose } = require("mongoose");

const commentSchema = new Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: { type: String, required: true },
    commentDate: { type: Date, default: Date.now },
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;