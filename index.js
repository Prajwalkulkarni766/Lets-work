const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectToMongoose = require("./db");
const app = express();
const port = process.env.PORT || 5000;
const path = require("path");

// connecting to the database
connectToMongoose();

app.use(
  session({
    secret: `${process.env.JWT_SECRET_KEY}`,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
    },
  })
);

// to receive request from browser
app.use(cors());

// to accept data in json format
app.use(express.json());

// Importing routes
app.use("/api/authenticate", require("./routes/authenticate"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/likes", require("./routes/like"));
app.use("/api/profiles", require("./routes/profile"));
app.use("/api/skills", require("./routes/skill"));
app.use("/api/experiences", require("./routes/experience"));
app.use("/api/education", require("./routes/education"));
app.use("/api/users", require("./routes/user"));
app.use("/api/connections", require("./routes/connection"));
app.use("/api/jobs", require("./routes/job"));

app.get("/:id", (req, res) => {
  const currentDirectory = process.cwd();
  let profile_image_url = path.join(currentDirectory, "docs", req.params.id);
  res.sendFile(profile_image_url);
});

app.use((req, res) => {
  res.json({ message: "404 ! Not found" });
});

app.listen(3000);
