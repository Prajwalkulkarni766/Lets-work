const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const notificationMessages = require("../utils/notificationMessages");
const Notification = require("../models/notification");
const jwt = require("jsonwebtoken");
const secreteKey = process.env.JWT_SECRET_KEY;

const getRequestSenderId = async (token) => {
    const data = jwt.verify(token, secreteKey);
    return data.userId || data.organizationId;
};


// router to get notification
router.get("/notification", async (req, res) => {
    try {
        let id;
        if (!req.header('token')) {
            res.status(400).json({ message: "Login to get notifications" });
        }
        else {
            id = await getRequestSenderId(req.header('token'));
        }
        const getNotifications = await Notification.find({ notificationTo: id });
        res.status(200).json(getNotifications);
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ message: "Server error" });
    }
})

// router to update notification status
router.put("/notification",
    body("notificationId").notEmpty().withMessage("Enter valid notification id"),
    body("notificationStatus").notEmpty().withMessage("Enter valid notification status"),
    async (req, res) => {
        try {

            const { notificationId, notificationStatus } = req.body;

            let requesterId = await getRequestSenderId(req.header('token'));

            // const findNotification = await Notification.findByIdAndUpdate(notificationId, {
            //     notificationReadStatus: notificationStatus,
            // });

            const filter = {
                _id: notificationId,
                notificationTo: requesterId,
            };

            const update = {
                notificationReadStatus: notificationStatus,
            }
            const findNotification = await Notification.findOneAndUpdate(filter, update);

            if (!findNotification) {
                res.status(400).json({ message: "Notification not found or this notification not belongs to you or problem while updating notification status" });
            }
            else {
                res.status(200).json({ message: "Notification status updated" });
            }
        }
        catch (error) {
            console.log("Error: ", e);
            res.status(500).json({ message: "Server error" });
        }
    })

module.exports = router;