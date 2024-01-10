const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const JobAdvertisement = require("../../models/organization/JobAdvertisement");
const Organization = require("../../models/organization/organization");
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

// get job applicants list
const getJobApplicants = async (jobAdvertisementId, organizationId, status) => {
    const findJobAdvertisement = await JobAdvertisement.findOne({ _id: jobAdvertisementId, organization: organizationId });

    if (!findJobAdvertisement) {
        return res.status(400).json({ message: "You don't have right to get job applications of another organization" });
    }

    const JobApplicatnts = await JobApplication.find({ jobAdvertisement: jobAdvertisementId });


    return JobApplicatnts;
}

// get the all job application
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
        console.log("Error : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// sortlist the job application - change status of the job application
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
            console.log("Error : ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    })

// sortlist the job application - change status of the job application
router.put("/automatic-jobApplicants", async (req, res) => {
    try {

        const organizationId = await getOrganizationId(req.header("token"));

        const { jobAdvertisementId } = req.body;

        // getting job advertisement given by organization
        const jobAdvertisement = await JobAdvertisement.findById(jobAdvertisementId);
        jobAdvertisement.requirements = jobAdvertisement.requirements.toLowerCase();

        // getting job application for the particular job
        let JobApplicatnts = await getJobApplicants(jobAdvertisementId, organizationId);

        // if job applications found
        if (JobApplicatnts.length > 0) {

            // watching each job application
            JobApplicatnts.forEach(async (applicant) => {

                // if applicant is already selected then go to next applicant
                if (applicant.status === "selected") {
                    return;
                }

                // getting skills of user from uploaded skills and matching with the requirement if matched then changing status of application from pending to selected
                const getUserSkills = await Skill.find({ user: applicant.user });

                // for checking mutliple skills
                getUserSkills.forEach(async (skill) => {

                    // changing job application status from pending to selected
                    if (jobAdvertisement.requirements.includes(skill.name.toLowerCase())) {
                        await JobApplication.findByIdAndUpdate(applicant._id, { status: "selected" });
                        return;
                    }

                });

                // reading pdf file i.e. resume and matching skills requirement for the job
                const pdfFile = fs.readFileSync("post/resumes/Resume.pdf");
                let pdfData = await pdfParse(pdfFile);
                pdfData = pdfData.text.toLowerCase();

                // if resume pdf match with skills requirement then change job application status from pending to selected
                if (pdfData.indexOf(jobAdvertisement.requirements) !== -1) {
                    await JobApplication.findByIdAndUpdate(applicant._id, { status: "selected" });
                    await sendJobApplicationSortlistedNotification(applicant.user, jobAdvertisement);
                }
            })
            res.status(200).json({ message: "Applications sortlisted" });
        }
        // if job application not found
        else {
            res.status(400).json({ message: "No one applied yet for this job" });
        }

    } catch (error) {
        console.log("Error : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router;