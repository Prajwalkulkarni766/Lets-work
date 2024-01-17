const { Schema, model, default: mongoose } = require("mongoose");
const likeSchema = new Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
});
const Like = model("Like", likeSchema);
module.exports = Like;