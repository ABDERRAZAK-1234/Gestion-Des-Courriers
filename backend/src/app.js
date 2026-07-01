const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const responsableRoutes = require("./routes/responsableRoutes");
const adminCourrierRoutes = require("./routes/adminCourrierRoutes");
const employeRoutes = require("./routes/employeRoutes");
const adminServiceRoutes = require("./routes/adminServiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const courrierRoutes = require("./routes/courriers");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "API Gestion des Courriers"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/courriers", courrierRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/courriers", adminCourrierRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/responsable", responsableRoutes);
app.use("/api/employe", employeRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;