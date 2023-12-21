const mongoose = require('mongoose');
const Job = require("../models/job");

const fetchJob = async (req, res, next) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Provide job id" });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job id format" });
        }

        const getJob = await Job.findById(jobId);

        if (getJob) {
            next();
        }
        else {
            return res.status(400).json({ message: "Job not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchJob;