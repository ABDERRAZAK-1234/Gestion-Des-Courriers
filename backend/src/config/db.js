const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connecté avec success');

    } catch (err) {
        console.error('Erreur lors de la connection, ', err.message);
        process.exit(1);

    }
};

module.exports = dbConnection;