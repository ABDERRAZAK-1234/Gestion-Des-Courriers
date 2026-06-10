const express = require("express");
const app = express();
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const adminUserRoutes = require('./routes/adminUserRoutes');
const responsableRoutes = require('./routes/responsableRoutes');

const adminCourrierRoutes = require('./routes/adminCourrierRoutes');
const employeRoutes = require('./routes/employeRoutes');
const adminServiceRoutes = require('./routes/adminServiceRoutes');

const notificationRoutes = require('./routes/notificationRoutes');

app.use(express.json());
// routes
app.use("/api/courriers", require("./routes/courriers"));

app.get("/", (req, res) => {
    res.json({
        message: "API Gestion des Courriers",
    });
});

// auth
app.use('/api/auth', authRoutes);
// admin
app.use('/api/admin/users', adminUserRoutes);
// admin courrier
app.use('/api/admin/courriers', adminCourrierRoutes);

// responsable
app.use('/api/responsable', responsableRoutes);

// employe
app.use('/api/employe', employeRoutes);

// gestion des services
app.use('/api/admin/services', adminServiceRoutes);

// notification
app.use('/api/notifications', notificationRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);




module.exports = app;
