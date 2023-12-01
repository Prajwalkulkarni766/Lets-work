const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Profile = require("../models/profile");
const Skill = require("../models/skill");
const Experience = require("../models/experience");
const Education = require("../models/education");
const fetchUser = require("../middleware/fetchUser");

router.use(fetchUser);

router.post("/profile",
    body("headLine", "Headline cannot be empty").isLength({ min: 1 }),
    body("summary", "Summary cannot be empty").isLength({ min: 1 }),
    body("industry", "Industry cannot be empty").isLength({ min: 1 }),
    body("location", "Location cannot be empty").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { headLine, summary, industry, location, industryType, website } = req.body;

            const newProfile = await Profile({
                user: req.body.userId,
                headline: headLine,
                summary: summary,
                industry: industry,
                location: location,
                industryType: industryType || undefined,
                website: website || undefined,
            });

            await newProfile.save();

            res.status(200).json({ mesaage: "Work profile added" });

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

router.post("/skill",
    body("name", "Enter valid skill name").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const newSkill = await Skill({
                user: req.body.userId,
                name: req.body.name,
            });

            await newSkill.save();

            res.status(200).json({ mesaage: "New skill added" });
        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

router.post("/experience",
    body("companyName", "Enter valid company name").isLength({ min: 1 }),
    body("title", "Enter valid job title").isLength({ min: 1 }),
    body("location", "Enter valid job location").isLength({ min: 1 }),
    body("startDate", "Enter valid job joining date").isDate(),
    body("endDate", "Enter valid job left date").isDate(),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { companyName, title, location, startDate, endDate } = req.body;

            const newExperience = await Experience({
                user: req.body.userId,
                companyName: companyName,
                title: title,
                location: location,
                startDate: startDate,
                endDate: endDate,
            });

            await newExperience.save();

            res.status(200).json({ mesaage: "Experience added" });
        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

router.post("/education",
    body("schoolName", "Enter valid school name").isLength({ min: 1 }),
    body("secondarySchoolName", "Enter valid secondary school name").isLength({ min: 1 }),
    body("collegeName", "Enter valid college name").isLength({ min: 1 }),
    body("degree", "Enter valid degree name").isLength({ min: 1 }),
    body("fieldOfStudy", "").isLength({ min: 1 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { schoolName, secondarySchoolName, collegeName, degree, fieldOfStudy } = req.body;

            const education = await Education({
                user: req.body.userId,
                schoolName: schoolName,
                secondarySchoolName: secondarySchoolName,
                collegeName: collegeName,
                degree: degree,
                fieldOfStudy: fieldOfStudy,
            });

            await education.save();

            res.status(200).json({ mesaage: "Education added" });
        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ mesaage: "Internal server error" });
        }
    });

module.exports = router;
// FIX-ME: Remove userId from request and test it with session merging with client-end