const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchUser");
const Connection = require("../models/connection");
const getUserId = require("../getUserId");

router.use(fetchUser);

// get connection
router.get("/connection/:id*?", async (req, res) => {
    try {
        let userId;
        if (req.params.id) {
            userId = req.params.id;
        }
        else {
            userId = await getUserId(req.header("token"));
        }

        const connections = await Connection.find({
            $or: [{ user: userId }, { connectionUserId: userId }],
        }).lean();

        res.status(200).json(connections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// to create or update connection
router.post("/connection", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.connectionWith)) {
            return res.status(400).json({ message: "Invalid connection ID" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = await getUserId(req.header("token"));
        const { connectionWith } = req.body;

        // Check for existing connection
        const existingConnection = await Connection.findOne({
            $or: [
                { user: userId, connectionUserId: connectionWith },
                { user: connectionWith, connectionUserId: userId },
            ],
        });

        if (existingConnection) {
            return res.status(400).json({ message: "Connection already present" });
        }

        // Create or update connection
        await Connection.findOneAndUpdate(
            {
                $or: [
                    { user: userId, connectionUserId: connectionWith },
                    { user: connectionWith, connectionUserId: userId },
                ],
            },
            {
                user: userId,
                connectionUserId: connectionWith,
            },
            { upsert: true }
        );

        res.status(200).json({ message: "Connection successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// to remove connection
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
        } else {
            res.status(400).json({ message: "Connection not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;