const allowedTransitions = {
    NOUVEAU: ['TRANSMIS'],
    TRANSMIS: ['RECU'],
    RECU: ['EN_COURS'],
    EN_COURS: ['TRAITE'],
    TRAITE: ['ARCHIVE'],
    ARCHIVE: []
};

const canChangeStatus = (currentStatus, nextStatus) => {
    return allowedTransitions[currentStatus]?.includes(nextStatus) || false;
};

const assertCanChangeStatus = (courrier, nextStatus) => {
    if (!courrier) {
        throw new Error('Courrier not found');
    }

    if (!canChangeStatus(courrier.statut, nextStatus)) {
        throw new Error(`Invalid workflow transition from ${courrier.statut} to ${nextStatus}`);
    }
};

module.exports = {
    canChangeStatus,
    assertCanChangeStatus
};