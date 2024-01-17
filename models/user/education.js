const { Schema, model, default: mongoose } = require("mongoose");
const educationSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    schoolName: { type: String, required: true },
    secondarySchoolName: { type: String, required: true },
    collegeName: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
});
const Education = model("Education", educationSchema);
module.exports = Education;
