const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const OrganizationProfile = require("../../models/organization/organizationProfile");
const getOrganizationId = require("../../utils/getOrganizationId");
const fetchOrganization = require("../../middleware/organization/fetchOrganization");
router.use(fetchOrganization);
router.get("/profile/:id*?", async (req, res) => {
    try {
        let organizationId;
        if (req.params.id) {
            organizationId = req.params.id;
        } else {
            organizationId = await getOrganizationId(req.header("token"));
        }
        const getProfile = await OrganizationProfile.find({ organization: organizationId });
        if (getProfile.length > 0) {
            res.status(200).json(getProfile);
        } else {
            res.status(400).json({ message: "Profile not found" });
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
router.post("/profile",
    body("organizationIndustry").notEmpty().withMessage("Enter valid industry"),
    body("organizationDescription").notEmpty().withMessage("Enter valid description"),
    body("organizationLocation").notEmpty().withMessage("Enter valid location"),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const organizationId = await getOrganizationId(req.header("token"));
            const { organizationIndustry, organizationDescription, organizationLocation } = req.body;
            const findProfile = await OrganizationProfile.find({ organization: organizationId });
            if (findProfile.length > 0) {
                return res
                    .status(400)
                    .json({ message: "Profile already created" });
            }
            const newProfile = await OrganizationProfile({
                organization: organizationId,
                industry: organizationIndustry,
                description: organizationDescription,
                location: organizationLocation,
            });
            await newProfile.save();
            if (newProfile._id) {
                res.status(200).json({ message: "Work profile added" });
            } else {
                res.status(400).json({ message: "Problem while adding work profile" });
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
router.put("/profile", async (req, res) => {
    try {
        const organizationId = await getOrganizationId(req.header("token"));
        const { organizationIndustry, organizationDescription, organizationLocation } = req.body;
        const filter = { organization: organizationId };
        const update = {
            industry: organizationIndustry || undefined,
            description: organizationDescription || undefined,
            location: organizationLocation || undefined,
        };
        const updateProfile = await OrganizationProfile.updateOne(filter, update);
        if (updateProfile.modifiedCount == 1) {
            res.status(200).json({ message: "Profile updated" });
        } else {
            res.status(400).json({ message: "Problem while deleting profile. You might have provided another profile related to another organization or vice versa" });
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
router.delete("/profile", async (req, res) => {
    try {
        const organizationId = await getOrganizationId(req.header("token"));
        const deleteProfile = await OrganizationProfile.deleteOne({ organization: organizationId });
        if (deleteProfile.deletedCount == 1) {
            res.status(200).json({ message: "Profile deleted" });
        } else {
            res.status(400).json({ message: "Problem while deleting profile. You might have provided another profile id related to another user or vice versa" });
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