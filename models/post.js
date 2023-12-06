const { Schema, model, default: mongoose } = require("mongoose");

const postsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: { type: String },
    content: { type: String, required: true },
    postDate: { type: Date, default: Date.now },
});

const Post = model("Post", postsSchema);
module.exports = Post;