const express = require("express");
const fs = require("fs");
const cors = require("cors");
const connectToMongoose = require("./config/db");
const app = express();
const path = require("path");
const dotenvConfig = require("./config/dotenv");
const port = dotenvConfig.PORT || 5000;
const helmet = require("helmet");
app.use(helmet());
connectToMongoose();
app.use(cors());
app.use(express.json());
app.use("/post/", express.static(path.join(__dirname, "post")));
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
app.use(
  "/api/organization/authenticate",
  require("./routes/organization/authenticate")
);
app.use(
  "/api/organization/profiles",
  require("./routes/organization/profile.js")
);
app.use("/api/organization/jobs", require("./routes/organization/job"));
app.use(
  "/api/organization/jobApplicants",
  require("./routes/organization/jobApplicants.js")
);
app.use("/api/notifications", require("./routes/notification.js"));
app.use((req, res) => {
  res.status(404).json({ message: "404 ! Not found" });
  const now = new Date();
  const dateString = `${now.getDate()}/${
    now.getMonth() + 1
  }/${now.getFullYear()}`;
  const dataToBeLogged = `Request url: ${req.protocol}://${req.hostname}:${port}${req.originalUrl}\nRequest date: ${dateString}\nRequest body: no data attached to body\nRequest error: Not found\n\n`;
  fs.appendFile("error.log", dataToBeLogged, function (err) {
    if (err) throw err;
  });
});
app.listen(port, () => {
  console.log(`Server running on post ${port}`);
});
