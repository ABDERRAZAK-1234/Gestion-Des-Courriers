const Courrier = require('../models/Courrier');

const generateCourrierReference = async (type) => {
    const prefix = type === 'ENTRANT' ? 'ENT' : 'SOR';

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePart = `${year}${month}${day}`;
    const referencePrefix = `${prefix}-${datePart}`;

    const lastCourrier = await Courrier.findOne({
        reference: new RegExp(`^${referencePrefix}-`)
    }).sort({ reference: -1 });

    let nextNumber = 1;

    if (lastCourrier) {
        const lastNumber = Number(lastCourrier.reference.split('-').pop());
        nextNumber = lastNumber + 1;
    }

    const sequence = String(nextNumber).padStart(4, '0');

    return `${referencePrefix}-${sequence}`;
};

module.exports = {
    generateCourrierReference
};