const express = require("express");
const app = express();

app.use(express.json());
// routes
app.use("/api/courriers", require("./routes/courriers"));

app.get("/", (req, res) => {
    res.json({
        message: "API Gestion des Courriers",
    });
});

module.exports = app;
