const mongoose = require('mongoose');
const JobAdvertisement = require("../../models/organization/JobAdvertisement");

const fetchJob = async (req, res, next) => {
    try {
        const { jobAdvertisementId } = req.body;

        if (!jobAdvertisementId) {
            return res.status(400).json({ message: "Provide job id" });
        }

        if (!mongoose.Types.ObjectId.isValid(jobAdvertisementId)) {
            return res.status(400).json({ message: "Invalid job id format" });
        }

        const getJob = await JobAdvertisement.findById(jobAdvertisementId);

        if (getJob) {
            next();
        }
        else {
            return res.status(400).json({ message: "Job advertisement not found" });
        }
    }
    catch (e) {
        console.error("error =>", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = fetchJob;