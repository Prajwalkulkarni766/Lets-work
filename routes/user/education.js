const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Education = require("../../models/user/education");
const fetchUser = require("../../middleware/user/fetchUser");
const getUserId = require("../../utils/getUserId");
router.use(fetchUser);
const validateEducationId = body("educationId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return Promise.reject("Enter a valid education id");
    }
    return Promise.resolve();
});
const validateSchoolName = body("schoolName", "Enter valid school name").isLength({ min: 1 });
const validateSecondarySchoolName = body("secondarySchoolName", "Enter valid secondary school name").isLength({ min: 1 });
const validateCollegeName = body("collegeName", "Enter valid college name").isLength({ min: 1 });
const validateDegree = body("degree", "Enter valid degree name").isLength({ min: 1 });
const validateFieldOfStudy = body("fieldOfStudy", "Enter valid field of study").isLength({ min: 1 });
router.get("/education/:id*?", async (req, res) => {
    try {
        let userId;
        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserId(req.header('token'));
        }
        const getEducation = await Education.findOne({ user: userId });
        if (getEducation) {
            res.status(200).json(getEducation);
        } else {
            res.status(404).json({ message: "Education not found" });
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
});
router.post("/education",
    validateSchoolName,
    validateSecondarySchoolName,
    validateCollegeName,
    validateDegree,
    validateFieldOfStudy,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = await getUserId(req.header('token'));
            const findEducation = await Education.findOne({ user: userId });
            if (findEducation) {
                return res.status(400).json({ message: "Education already present" });
            }
            const { schoolName, secondarySchoolName, collegeName, degree, fieldOfStudy } = req.body;
            const education = await Education.create({
                user: userId,
                schoolName,
                secondarySchoolName,
                collegeName,
                degree,
                fieldOfStudy,
            });
            res.status(200).json({ message: "Education added" });
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
    });
router.put("/education",
    validateEducationId,
    validateSchoolName,
    validateSecondarySchoolName,
    validateCollegeName,
    validateDegree,
    validateFieldOfStudy,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = await getUserId(req.header('token'));
            const { educationId, schoolName, secondarySchoolName, collegeName, degree, fieldOfStudy } = req.body;
            const filter = { _id: educationId, user: userId };
            const update = {
                schoolName: schoolName || undefined,
                secondarySchoolName: secondarySchoolName || undefined,
                collegeName: collegeName || undefined,
                degree: degree || undefined,
                fieldOfStudy: fieldOfStudy || undefined,
            };
            const updateEducation = await Education.updateOne(filter, update);
            if (updateEducation.modifiedCount === 1) {
                res.status(200).json({ message: "Education updated" });
            } else {
                res.status(404).json({ message: "Education not found" });
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
    });
module.exports = router;