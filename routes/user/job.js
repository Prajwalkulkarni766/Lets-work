const fs = require("fs");
const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUser = require("../../middleware/user/fetchUser");
const getUserId = require("../../utils/getUserId");
const JobAdvertisement = require("../../models/organization/JobAdvertisement");
const Skill = require("../../models/user/skill");
const JobApplication = require("../../models/user/JobApplication");
const mongoose = require('mongoose');
const Resume = require("../../models/user/resume");
router.use(fetchUser);
router.get("/job/:id*?", async (req, res) => {
    try {
        if (req.query.id) {
            const job = await JobAdvertisement.find({ title: req.query.id, isDisabled: false });
            if (job.length > 0) {
                res.status(200).json(job);
            }
            else {
                res.status(400).json({ message: "Job not found" })
            }
        }
        else {
            const userId = await getUserId(req.header('token'));
            const skillsOfUser = await Skill.find({ user: userId });
            const jobList = await JobAdvertisement.find({ isDisabled: false });
            const newJobList = jobList.filter((job) => {
                job.requirements = job.requirements.toLowerCase();
                return skillsOfUser.some((skill) =>
                    job.requirements.includes(skill.name.toLowerCase())
                );
            });
            if (newJobList.length > 0) {
                res.status(200).json(newJobList);
            }
            else {
                res.status(400).json({ message: "Job not found according to your skills" });
            }
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
router.post("/job",
    body("jobAdvertisement").notEmpty().withMessage("Please provide job advertisement id"),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = await getUserId(req.header('token'));
            const { jobAdvertisement } = req.body;
            if (!mongoose.Types.ObjectId.isValid(jobAdvertisement)) {
                return res.status(400).json({ message: "Invalid job advertisement id format" });
            }
            const getUserApplication = await JobApplication.findOne({ user: userId, jobAdvertisement: jobAdvertisement });
            if (getUserApplication) {
                return res.status(400).json({ message: "Your already applied for this job" });
            }
            const getUserResume = await Resume.findOne({ user: userId });
            if (!getUserResume) {
                res.status(400).json({ message: "Upload your resume for apply any job" });
            }
            const newJobApplication = await JobApplication({
                user: userId,
                jobAdvertisement: jobAdvertisement,
                resume: getUserResume.resume,
                status: "pending",
            });
            await newJobApplication.save();
            if (newJobApplication._id) {
                res.status(200).json({ message: "Successfully added job application" });
            }
            else {
                res.status(400).json({ message: "Problem while adding job application" });
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
router.delete("/job",
    body("jobAdvertisement").notEmpty().withMessage("Please provide job advertisement id"),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = await getUserId(req.header('token'));
            const { jobAdvertisement } = req.body;
            if (!mongoose.Types.ObjectId.isValid(jobAdvertisement)) {
                return res.status(400).json({ message: "Invalid job advertisement id format" });
            }
            const deleteJobApplication = await JobApplication.findOneAndDelete({ user: userId, jobAdvertisement: jobAdvertisement });
            if (deleteJobApplication) {
                res.status(400).json({ message: "Successfully removed your job application" });
            }
            else {
                res.status(400).json({ message: "You don't applied for this job yet" });
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