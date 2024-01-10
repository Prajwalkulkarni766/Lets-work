const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const secreteKey = process.env.JWT_SECRET_KEY;
const Organization = require("../../models/organization/organization");
const Notification = require("../../models/notification");
const { sendSignupNotification } = require("../../utils/notificationSender");

// login
router.post("/signin",
    body("organizationEmail", "Enter valid email").isEmail().withMessage("Enter a valid email"),
    body("organizationPassword")
        .isLength({ min: 8, max: 16 })
        .withMessage("Enter valid password"),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { organizationEmail, organizationPassword } = req.body;

            let organization = await Organization.find({ email: organizationEmail });

            if (!organization) {
                return res.status(400).json({ message: "Organization not found" });
            }

            organization = organization[0];

            const isPasswordValid = await bcrypt.compare(organizationPassword, organization.password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid password" });
            }

            const token = jwt.sign({ organizationId: organization._id }, secreteKey, {
                expiresIn: 86400,
            });

            res.cookie("token", token);

            res.status(200).json({ message: "Login successful" });
        } catch (e) {
            console.log("Error: ", e);
            res.status(500).json({ message: "Internal server error" });
        }
    })

// sign up
router.post("/signup",
    body("organizationName").notEmpty().withMessage("Enter valid name of the organization"),
    body("organizationEmail").isEmail().withMessage("Enter a valid email"),
    body("organizationPassword")
        .notEmpty()
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must contain at least one alphabet, one number, and one special symbol and lenght should be between 8 to 16"),
    body("organizationPhoneNumber").isMobilePhone().withMessage("Enter valid contact number"),
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { organizationName, organizationEmail, organizationPassword, organizationPhoneNumber } = req.body;

            const findOrganization = await Organization.find({ email: organizationEmail });

            if (findOrganization.length > 0) {
                return res.status(400).json({ message: "Another organization with the same email already exists" });
            }

            const hashedPassword = await bcrypt.hash(organizationPassword, 10);

            const newOrganization = await Organization({
                name: organizationName,
                email: organizationEmail,
                password: hashedPassword,
                phoneNumber: organizationPhoneNumber,
            });

            await newOrganization.save();

            if (newOrganization._id) {

                const token = jwt.sign({ organizationId: newOrganization._id }, secreteKey, {
                    expiresIn: 86400,
                });
                res.cookie("token", token);
                res.status(200).json({ message: "Signup success" });

                await sendSignupNotification(newOrganization._id, organizationName);
            }
            else {
                res.status(400).json({ message: "Something went wrong" });
            }
        } catch (e) {
            console.log("Error: ", e);
            res.status(500).json({ message: "Internal server error", e });
        }
    })

module.exports = router;