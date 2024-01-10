const mongoose = require('mongoose');

const jobAdvertisementSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    organizationName: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    isDisabled: {
        type: Boolean,
        required: true,
    },
    postedAt: {
        type: Date,
        default: Date.now,
    },
});

const JobAdvertisement = mongoose.model('JobAdvertisement', jobAdvertisementSchema);
module.exports = JobAdvertisement;
