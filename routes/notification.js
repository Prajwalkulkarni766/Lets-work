const fs = require("fs");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Notification = require("../models/notification");
const jwt = require("jsonwebtoken");
const secreteKey = process.env.JWT_SECRET_KEY;
const getRequestSenderId = async (token) => {
    const data = jwt.verify(token, secreteKey);
    return data.userId || data.organizationId;
};
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
router.put("/notification",
    body("notificationId").notEmpty().withMessage("Enter valid notification id"),
    body("notificationStatus").notEmpty().withMessage("Enter valid notification status"),
    async (req, res) => {
        try {
            const { notificationId, notificationStatus } = req.body;
            let requesterId = await getRequestSenderId(req.header('token'));
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