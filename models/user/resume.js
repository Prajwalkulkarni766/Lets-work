const { Schema, model, default: mongoose } = require("mongoose");

const resumeSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    resume: { type: String, required: true },
    resumeAddedDate: { type: Date, default: Date.now },
});

const Resume = model("Resume", resumeSchema);
module.exports = Resume;