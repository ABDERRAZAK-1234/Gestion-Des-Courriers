const express = require("express");
const app = express();
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const adminUserRoutes = require('./routes/adminUserRoutes');

const adminCourrierRoutes = require('./routes/adminCourrierRoutes');

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



// error handling
app.use(notFound);
app.use(errorHandler);




module.exports = app;
