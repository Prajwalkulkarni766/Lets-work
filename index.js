const express = require("express");
const cors = require('cors');
const session = require('express-session');
const connectToMongoose = require("./db");
const app = express();
const multer = require("multer");
const port = process.env.PORT || 5000;

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

app.use(cors());

app.use(express.json());

// Importing routes
app.use("/api/authenticate", require("./routes/authenticate"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/profiles", require("./routes/profile"));

app.listen(3000);