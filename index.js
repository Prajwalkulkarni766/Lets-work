const express = require("express");
const cors = require("cors");
const connectToMongoose = require("./config/db");
const app = express();
const path = require("path");
const dotenvConfig = require("./config/dotenv");
const port = dotenvConfig.PORT || 5000;
const helmet = require("helmet");

// using helment for securing api
app.use(helmet());

// connecting to the database
connectToMongoose();

// to receive request from browser
app.use(cors());

// to accept data in json format
app.use(express.json());

// serving files from post folder
app.use('/post/', express.static(path.join(__dirname, 'post')));

// routes related to user
app.use("/api/user/authenticate", require("./routes/user/authenticate"));
app.use("/api/user/posts", require("./routes/user/post"));
app.use("/api/user/comments", require("./routes/user/comment"));
app.use("/api/user/likes", require("./routes/user/like"));
app.use("/api/user/profiles", require("./routes/user/profile"));
app.use("/api/user/skills", require("./routes/user/skill"));
app.use("/api/user/experiences", require("./routes/user/experience"));
app.use("/api/user/education", require("./routes/user/education"));
app.use("/api/user/users", require("./routes/user/user"));
app.use("/api/user/connections", require("./routes/user/connection"));
app.use("/api/user/jobs", require("./routes/user/job"));
app.use("/api/user/resumes", require("./routes/user/resume"));

// routes related to organization
app.use("/api/organization/authenticate", require("./routes/organization/authenticate"));
app.use("/api/organization/profiles", require("./routes/organization/profile.js"));
app.use("/api/organization/jobs", require("./routes/organization/job"));
app.use("/api/organization/jobApplicants", require("./routes/organization/jobApplicants.js"));

// common routes for both organization and user
app.use("/api/notifications", require("./routes/notification.js"));

app.use((req, res) => {
  res.status(404).json({ message: "404 ! Not found" });
});

app.listen(port, () => {
  console.log(`Server running on post ${port}`);
});
