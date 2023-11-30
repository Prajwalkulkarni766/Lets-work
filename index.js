const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Jello");
})

app.listen(3000);