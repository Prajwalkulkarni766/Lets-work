const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobAdvertisement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAdvertisement',
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    requried: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
