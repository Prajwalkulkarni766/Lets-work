const fs = require("fs");
const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
const fetchUser = require("../../middleware/user/fetchUser");
const Connection = require("../../models/user/connection");
const getUserId = require("../../utils/getUserId");
const { sendConnectionRequestAcceptance, sendConnectionRequestReject } = require("../../utils/notificationSender");
router.use(fetchUser);
router.get("/connection/:id*?", async (req, res) => {
    try {
        let userId;
        let connections;
        if (req.params.id) {
            console.log(req.params.id);
            userId = req.params.id;
            userId = req.params.id;
            connections = await Connection.find({
                $or: [
                    { user: userId },
                    { connectionUserId: userId },
                ],
                connectionStatus: "active"
            }).lean();
        }
        else {
            userId = await getUserId(req.header("token"));
            connections = await Connection.find({
                $or: [{ user: userId }, { connectionUserId: userId }],
            }).lean();
        }
        res.status(200).json(connections);
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
router.post("/connection", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.connectionWith)) {
            return res.status(400).json({ message: "Invalid connection with ID" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = await getUserId(req.header("token"));
        const { connectionWith } = req.body;
        const existingConnection = await Connection.findOne({
            $or: [
                { user: userId, connectionUserId: connectionWith },
                { user: connectionWith, connectionUserId: userId },
            ],
        });
        if (existingConnection) {
            return res.status(400).json({ message: "Connection already present" });
        }
        const newConnection = await Connection({
            user: userId,
            connectionUserId: connectionWith,
            connectionStatus: "pending",
        });
        await newConnection.save();
        if (newConnection._id) {
            res.status(200).json({ message: "Connection request successful made" });
        }
        else {
            res.status(400).json({ message: "Problem while creating connection request" });
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
router.put("/connection",
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.connectionId)) {
                return res.status(400).json({ message: "Invalid connection ID" });
            }
            const userId = await getUserId(req.header("token"));
            const { connectionId } = req.body;
            const getConnection = await Connection.findById(connectionId);
            if (!getConnection) {
                return res.status(400).json({ message: "Connection not found" });
            }
            else if (getConnection.connectionUserId != userId) {
                return res.status(400).json({ message: "You don't have right to update anyone else connection request" });
            }
            else if (getConnection.connectionStatus == "active") {
                return res.status(400).json({ message: "Connection already active" });
            }
            const update = { connectionStatus: "active" };
            const updateConnection = await Connection.findByIdAndUpdate(connectionId, update);
            res.status(200).json({ message: "Connection status updated" });
            await sendConnectionRequestAcceptance(getConnection);
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
router.delete("/connection", async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { connectionId } = req.body;
        const deletedConnection = await Connection.findByIdAndDelete(connectionId);
        if (deletedConnection) {
            res.status(200).json({ message: "Connection deleted" });
            await sendConnectionRequestReject(deletedConnection);
        } else {
            res.status(400).json({ message: "Connection not found" });
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