const express = require("express");
const cors = require('cors');
const session = require('express-session');
const connectToMongoose = require("./db");
const app = express();
const multer = require("multer");
const port = process.env.PORT || 5000;

// connecting to the database
connectToMongoose();

app.use(session({
    secret: `${process.env.JWT_SECRET_KEY}`,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: true,
    },
}));

// to receive request from browser
app.use(cors());

// to accept data in json format
app.use(express.json());

// Importing routes
app.use("/api/authenticate", require("./routes/authenticate"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/profiles", require("./routes/profile"));
app.use("/api/skills", require("./routes/skill"));
app.use("/api/experiences", require("./routes/experience"));
app.use("/api/education", require("./routes/education"));
app.use("/api/users", require("./routes/user"));

app.listen(3000);

// TO-DO: Remove userId from request and test it with session merging with client-end