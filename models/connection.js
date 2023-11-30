const { Schema, model, default: mongoose } = require("mongoose");

const connectionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    connectionUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    connectionStatus: {
        type: String
    },
});

const Connection = model("Connection", connectionSchema);
module.exports = Connection;