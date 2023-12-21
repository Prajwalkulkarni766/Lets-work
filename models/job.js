const { Schema, model, default: mongoose } = require("mongoose");

const job = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  jobName: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  jobPackage: {
    type: BigInt,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobPost: {
    type: String,
    required: true,
  },
});

const Job = model("job", job);
module.exports = Job;
