const { Schema, model, default: mongoose } = require("mongoose");

const skillsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: { type: String, required: true },
});

const Skill = model("Skill", skillsSchema);
module.exports = Skill;