const express = require("express")
const router = express.Router();
const Resume = require("../../models/user/resume");
const { body, validationResult } = require('express-validator');
const fetchUser = require("../../middleware/user/fetchUser");
const getUserId = require("../../utils/getUserId");
const upload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

router.use(fetchUser);

router.use(upload());

// to get resume
router.get("/resume/:id*?", async (req, res) => {
    try {

        let userId;

        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserId(req.header('token'));
        }

        const getUserResume = await Resume.findOne({ user: userId });

        // const url = `http://${req.get('host')}${getUserResume.resume}`;
        // res.send(url);

        const resumeUrl = path.join(process.cwd(), getUserResume.resume);
        res.sendFile(resumeUrl);

    } catch (error) {
        console.log("Error : ", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

// to add resume
router.post("/resume", async (req, res) => {
    try {
        const userId = await getUserId(req.header('token'));

        const file = req.files.resume;

        if (!file) {
            return res.status(400).json({ message: "No profile image provided" });
        }
        else if (path.extname(file.name) !== ".pdf") {
            return res.status(400).json({ message: "Resume must be in form of pdf" });
        }

        const getUserResume = await Resume.findOne({ user: userId });

        if (getUserResume != null && getUserResume.resume && getUserResume.resume !== "") {
            const currentDirectory = process.cwd();
            const resumeUrl = path.join(currentDirectory, getUserResume.resume);
            fs.unlinkSync(resumeUrl);
        }

        const uniqueFileName = Date.now() + "-" + file.name;

        const mvFileAsync = (filePath, destination) => {
            return new Promise((resolve, reject) => {
                file.mv(filePath, function (err) {
                    if (err) {
                        console.error("Error uploading file:", err);
                        reject(err);
                    } else {
                        resolve(destination);
                    }
                });
            });
        };

        const destinationPath = await mvFileAsync(
            path.join("./post/resumes", uniqueFileName)
        );

        if (!getUserResume) {
            const newResume = await Resume({
                user: userId,
                resume: "/post/resumes/" + uniqueFileName,
            });

            await newResume.save();

            if (newResume._id) {
                return res.status(200).json({ message: "Resume uploaded" });
            }
            else {
                return res.status(400).json({ message: "Porblem while uploading resume" });
            }
        }
        else {
            const update = { resume: "/post/resumes/" + uniqueFileName };

            const updateUser = await Resume.findOneAndUpdate({ user: userId }, update);

            res.status(200).json({ message: "Resume uploaded" });
        }

    } catch (error) {
        console.log("Error : ", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

// to remove resume 
router.delete("/resume", async (req, res) => {
    try {

        const userId = await getUserId(req.header('token'));

        const getUserResume = await Resume.findOne({ user: userId });

        if (getUserResume !== null && getUserResume.resume && getUserResume.resume !== "") {
            const currentDirectory = process.cwd();
            const resumeUrl = path.join(currentDirectory, getUserResume.resume);
            fs.unlinkSync(resumeUrl);
            const deleteUserResume = await Resume.deleteOne({ user: userId });
            res.status(200).json({ message: "Successfully deleted" });
        }
        else {
            res.status(400).json({ message: "Resume not uploaded yet" });
        }

    } catch (error) {
        console.log("Error : ", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;