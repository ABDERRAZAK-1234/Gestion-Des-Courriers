const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const calculateChecksum = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

const buildFileMetadata = async (file) => {
    const checksum = await calculateChecksum(file.path);

    return {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        size: file.size,
        checksum,
        uploadedAt: new Date()
    };
};

module.exports = {
    buildFileMetadata
};