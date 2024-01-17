const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const JobAdvertisement = require("../../models/organization/JobAdvertisement");
const fetchJobAdvertisement = require("../../middleware/organization/fetchJobAdvertisement");
const getOrganizationId = require("../../utils/getOrganizationId");
const fetchOrganization = require("../../middleware/organization/fetchOrganization");
const JobApplication = require("../../models/user/JobApplication");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Skill = require("../../models/user/skill");
const { sendJobApplicationSortlistedNotification } = require("../../utils/notificationSender");
router.use(fetchOrganization);
router.use(fetchJobAdvertisement);
const getJobApplicants = async (jobAdvertisementId, organizationId, status) => {
    const findJobAdvertisement = await JobAdvertisement.findOne({ _id: jobAdvertisementId, organization: organizationId });
    if (!findJobAdvertisement) {
        return res.status(400).json({ message: "You don't have right to get job applications of another organization" });
    }
    const JobApplicatnts = await JobApplication.find({ jobAdvertisement: jobAdvertisementId });
    return JobApplicatnts;
}
router.get("/jobApplicants/", async (req, res) => {
    try {
        const organizationId = await getOrganizationId(req.header("token"));
        const { jobAdvertisementId } = req.body;
        let JobApplicatnts = await getJobApplicants(jobAdvertisementId, organizationId);
        if (JobApplicatnts.length > 0) {
            JobApplicatnts.forEach((applicant) => {
                if (applicant.resume) {
                    applicant.resume = `http://${req.get('host')}${applicant.resume}`;
                }
            })
            res.status(200).json(JobApplicatnts);
        }
        else {
            res.status(400).json({ message: "No one applied yet for this job" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        const now = new Date();
        const dateString = `${now.getDate()}/${now.getMonth() + 1
          }/${now.getFullYear()}`;
        const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
        fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
          if (err) throw err;
        });
      }
})
router.put("/manual-jobApplicants",
    body("jobAdvertisementId").notEmpty().withMessage("Provide valid job advertisement id"),
    body("userId").notEmpty().withMessage("Provide valid user id"),
    body("status").notEmpty().withMessage("Provide valid status for update"),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const organizationId = await getOrganizationId(req.header("token"));
            const { jobAdvertisementId, userId, status } = req.body;
            const getJobAdvertisement = await JobAdvertisement.findOne({ _id: jobAdvertisementId, organization: organizationId });
            if (!getJobAdvertisement) {
                res.status(400).json({ message: "Job not found" });
            }
            else if (getJobAdvertisement.isDisabled === true) {
                res.status(400).json({ message: "You already disabled recruitment" })
            }
            const updateJobApplication = await JobApplication.findOneAndUpdate({ user: userId, jobAdvertisement: jobAdvertisementId }, { status: status });
            if (updateJobApplication) {
                res.status(200).json({ message: "Application status changed" });
                await sendJobApplicationSortlistedNotification(userId, getJobAdvertisement);
            }
            else {
                res.status(400).json({ message: "Problem while updating application status" });
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
            const now = new Date();
            const dateString = `${now.getDate()}/${now.getMonth() + 1
              }/${now.getFullYear()}`;
            const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
            fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
              if (err) throw err;
            });
          }
    })
router.put("/automatic-jobApplicants", async (req, res) => {
    try {
        const organizationId = await getOrganizationId(req.header("token"));
        const { jobAdvertisementId } = req.body;
        const jobAdvertisement = await JobAdvertisement.findById(jobAdvertisementId);
        jobAdvertisement.requirements = jobAdvertisement.requirements.toLowerCase();
        let JobApplicatnts = await getJobApplicants(jobAdvertisementId, organizationId);
        if (JobApplicatnts.length > 0) {
            JobApplicatnts.forEach(async (applicant) => {
                if (applicant.status === "selected") {
                    return;
                }
                const getUserSkills = await Skill.find({ user: applicant.user });
                getUserSkills.forEach(async (skill) => {
                    if (jobAdvertisement.requirements.includes(skill.name.toLowerCase())) {
                        await JobApplication.findByIdAndUpdate(applicant._id, { status: "selected" });
                        return;
                    }
                });
                const pdfFile = fs.readFileSync("post/resumes/Resume.pdf");
                let pdfData = await pdfParse(pdfFile);
                pdfData = pdfData.text.toLowerCase();
                if (pdfData.indexOf(jobAdvertisement.requirements) !== -1) {
                    await JobApplication.findByIdAndUpdate(applicant._id, { status: "selected" });
                    await sendJobApplicationSortlistedNotification(applicant.user, jobAdvertisement);
                }
            })
            res.status(200).json({ message: "Applications sortlisted" });
        }
        else {
            res.status(400).json({ message: "No one applied yet for this job" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        const now = new Date();
        const dateString = `${now.getDate()}/${now.getMonth() + 1
          }/${now.getFullYear()}`;
        const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:port${req.originalUrl}\nRequest date: ${dateString}\nRequest body: ${JSON.stringify(req.body)}\nRequest error: ${error}\n\n`;
        fs.appendFile(`${process.cwd()}/error.log`, dataToBeLogged, function (err) {
          if (err) throw err;
        });
      }
})
module.exports = router;