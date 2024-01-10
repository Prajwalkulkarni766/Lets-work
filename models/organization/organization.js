const { Schema, model, default: mongoose } = require("mongoose");

const organization = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: BigInt,
        required: true,
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
});

const Organization = model("Organization", organization);
module.exports = Organization;