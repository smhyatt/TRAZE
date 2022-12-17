const { QueryFile } = require('pg-promise');
const path = require('path'); // Combining paths easily
const sql = file => {
    const fullPath = path.join(__dirname, file);
    return new QueryFile(fullPath, { minify: true });
};
module.exports = {
    // Table handling
    resetSchema: sql('resetSchema.sql'),
    schema: sql('schema.sql'),
    // Agent queries
    createAgent: sql('createAgent.sql'),
    createDesignatedAgent: sql('createDesignatedAgent.sql'),
    getAgent: sql('getAgent.sql'),
    getAgents: sql('getAgents.sql'),
    getAgentHolding: sql('getAgentHolding.sql'),
    // Resource Type queries
    createResourceType: sql('createResourceType.sql'),
    getResourceTypes: sql('getResourceTypes.sql'),
    getResourceType: sql('getResourceType.sql'),
    getResourceTypeBasedOnType: sql('getResourceTypeBasedOnType.sql'),
    deleteResourceTypeById: sql('deleteResourceTypeById.sql'),
    // Ownership queries
    createOwnership: sql('createOwnership.sql'),
    getOwnerships: sql('getOwnerships.sql'),
    delOwnership: sql('deleteOwnership.sql'),
    getOwnershipstate: sql('getOwnershipstate.sql'),
    // Transfer queries
    createTransfer: sql('createTransfer.sql'),
    getTransfer: sql('getTransfer.sql'),
    selectTransferByAgentId: sql('selectTransferByAgentId.sql'),
    // Location queries
    createLocation: sql('createLocation.sql'),
    createDesignatedLocation: sql('createDesignatedLocation.sql'),
    getLocation: sql('getLocation.sql'),
    getLocations: sql('getLocations.sql'),
    getLocationHolding: sql('getLocationHolding.sql'),
    insertResourceLocation: sql('insertResourceLocation.sql'),
    getLocationsState: sql('getLocationsState.sql'),
    // Transport queries
    getTransport: sql('getTransport.sql'),
    getTransports: sql('getTransports.sql'),
    getTransportLocation: sql('getTransportLocation.sql'),
    getTransportsByAgent: sql('getTransportsByAgent.sql'),
    // Transformation queries
    getTransformation: sql('getTransformation.sql'),
    getTransformationInput: sql('getTransformationInput.sql'),
    getTransformationOutput: sql('getTransformationOutput.sql'),
    getTransformations: sql('getTransformations.sql'),
    getTransformationsByOwner: sql('getTransformationsByOwner.sql'),
    // Carbon credit certificate queries
    createCarbonCreditCertificate: sql('createCarbonCreditCertificate.sql'),
    getCarbonCreditCertificate: sql('getCarbonCreditCertificate.sql'),
    getCarbonCreditCertificates: sql('getCarbonCreditCertificates.sql'),
    checkCCCAreasOverlap: sql('checkCCCAreasOverlap.sql'),
    deleteCCCById: sql('deleteCCCById.sql'),
    // Carbon credit certificate retire(transfer) queries
    createRetire: sql('createRetire.sql'),
    getAllRetired: sql('getAllRetired.sql'),
    getRetiredById: sql('getRetiredById.sql'),
    cccExists: sql('cccExists.sql')
};
//# sourceMappingURL=queries.js.map