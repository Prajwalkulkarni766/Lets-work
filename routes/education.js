const express = require("express")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Education = require("../models/education");
const fetchUser = require("../middleware/fetchUser");

router.use(fetchUser);

// get education
router.get("/education", async (req, res) => {
    try {
        const getEducation = await Education.findOne({ user: req.body.userId });

        if (getEducation) {
            res.status(200).json(getEducation);
        }
        else {
            res.status(400).json({ message: "Education not found" });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// add the education
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

            const { userId, schoolName, secondarySchoolName, collegeName, degree, fieldOfStudy } = req.body;

            const findEducation = await Education.find({ user: userId });

            if (findEducation.length == 0) {
                const education = await Education({
                    user: userId,
                    schoolName: schoolName,
                    secondarySchoolName: secondarySchoolName,
                    collegeName: collegeName,
                    degree: degree,
                    fieldOfStudy: fieldOfStudy,
                });

                await education.save();

                res.status(200).json({ message: "Education added" });
            }
            else {
                res.status(400).json({ message: "Education already present" });
            }

        } catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

// update education
router.put("/education", async (req, res) => {
    try {
        const { userId, educationId, schoolName, secondarySchoolName, collegeName, degree, fieldOfStudy } = req.body;

        const filter = { _id: educationId, user: userId };

        const update = {
            schoolName: schoolName || undefined,
            secondarySchoolName: secondarySchoolName || undefined,
            collegeName: collegeName || undefined,
            degree: degree || undefined,
            fieldOfStudy: fieldOfStudy || undefined,
        };

        const updateEducation = await Education.updateOne(filter, update);

        console.log(updateEducation);

        if (updateEducation) {
            res.status(200).json({ message: "Education updated" });
        }
        else {
            res.status(400).json({ message: "Problem while updating education" });
        }

    } catch (e) {
        console.error("error => ", e);
        return res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router;