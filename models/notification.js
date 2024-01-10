const { Schema, model, default: mongoose } = require("mongoose");

const notificationSchema = new Schema({
    notificationTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' || 'Organization'
    },
    notificationTitle: {
        type: String,
        required: true
    },
    notificationContent: {
        type: String,
        required: true
    },
    notificationReadStatus: {
        type: Boolean,
        required: true
    },
    notificationDateTime: {
        type: Date,
        default: Date.now
    },
});

const Notification = model("Notification", notificationSchema);
module.exports = Notification;