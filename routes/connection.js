const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchUser");
const Connection = require("../models/connection");

router.use(fetchUser);

router.post("/connection",
    body("connectionWith").custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return Promise.reject("Enter a valid connection with id");
        }
        return Promise.resolve();
    }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId, connectionWith } = req.body;

            const findConnection = await Connection.find({
                $or: [
                    { user: userId, connectionUserId: connectionWith },
                    { user: connectionWith, connectionUserId: userId },
                ],
            });

            if (findConnection.length > 0) {
                res.status(400).json({ message: "Connection already present" });
            }

            const newConnection = await Connection({
                user: userId,
                connectionUserId: connectionWith,
            });

            await newConnection.save();

            const newConnectionId = newConnection._id;

            res.status(200).json({ message: "Connection successful", id: newConnectionId });
        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

router.delete("/connection",
    body("connectionId").custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return Promise.reject("Enter a valid connection id");
        }
        return Promise.resolve();
    }),
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { connectionId } = req.body;

            const deleteConnection = await Connection.findByIdAndDelete(connectionId);

            if (deleteConnection) {
                res.status(200).json({ message: "Connection deleted" });
            }
            else {
                res.status(400).json({ message: "Problem while deleting the connection" });
            }

        }
        catch (e) {
            console.error("error => ", e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

module.exports = router;