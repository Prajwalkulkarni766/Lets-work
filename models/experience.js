const { Schema, model, default: mongoose } = require("mongoose");

const experienceSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    companyName: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
});

const Experience = model("Experience", experienceSchema);
module.exports = Experience;
