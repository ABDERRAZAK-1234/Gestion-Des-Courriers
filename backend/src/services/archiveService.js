const fs = require('fs');
const path = require('path');

const sanitizeFolderName = (name) => {
    return name
        .trim()
        .replace(/[<>:"/\\|?*]/g, '-')
        .replace(/\s+/g, '_');
};

const archiveCourrierFileByService = async (courrier, service) => {
    if (!courrier.filePath) {
        return null;
    }

    const currentPath = path.resolve(courrier.filePath);

    if (!fs.existsSync(currentPath)) {
        return null;
    }

    const serviceFolder = sanitizeFolderName(service.nom);
    const archiveDir = path.join(__dirname, '../../uploads/archives', serviceFolder);

    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
    }

    const fileName = path.basename(currentPath);
    const archivedPath = path.join(archiveDir, fileName);

    fs.renameSync(currentPath, archivedPath);

    return archivedPath;
};

module.exports = {
    archiveCourrierFileByService
};