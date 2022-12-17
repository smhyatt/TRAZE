"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationRepo = void 0;
const pgp = require('pg-promise')({
    capSQL: true // ! Obs caplock has to be on. 
});
const instance_1 = require("../database/instance");
const { getTransformation, getTransformationInput, getTransformationOutput, getTransformations, getTransformationsByOwner, } = require('../database/queries');
class TransformationRepo {
    addTransformation(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transformationDB, transformationInputDB, transformationOutputDB, ownershipDB, locationDB } = input;
            // * Insertion to Transformation
            const transCols = ['id', 'owner', 'time_of_effect', 'info'];
            const cs1 = new pgp.helpers.ColumnSet(transCols, { table: 'transformation' });
            const insert = pgp.helpers.insert(transformationDB, cs1) + ' RETURNING *;';
            // * The ownership table might already have the agent and resource type registered, 
            // * so we do an UPSERT, to update instead, when the agent and type already exist.
            const ownerCols = ['agent', 'type', 'amount'];
            const cs2 = new pgp.helpers.ColumnSet(ownerCols, { table: 'ownership' });
            const onConflict1 = ' ON CONFLICT(agent, type) DO UPDATE SET ' +
                cs2.assignColumns({ from: 'EXCLUDED', skip: ['agent', 'type'] });
            const upsert1 = pgp.helpers.insert(ownershipDB, cs2) + onConflict1; // * Generates upsert
            // * The same for location state as with ownership, if there are locations in transformation. 
            let upsert2;
            if (locationDB.length > 0) {
                const locCols = ['location_id', 'resource_type', 'amount'];
                const cs3 = new pgp.helpers.ColumnSet(locCols, { table: 'location_state' });
                const onConflict2 = ' ON CONFLICT(location_id, resource_type) DO UPDATE SET ' +
                    cs3.assignColumns({ from: 'EXCLUDED', skip: ['location_id', 'resource_type'] });
                upsert2 = pgp.helpers.insert(locationDB, cs3) + onConflict2; // * Generates upsert
            }
            // * Insert into Transformation input and output tables. 
            const inOutCols = ['transformation', 'type', 'amount'];
            const cs4 = new pgp.helpers.ColumnSet(inOutCols, { table: 'transformation_input' });
            const inputQuery = pgp.helpers.insert(transformationInputDB, cs4) + ' RETURNING *;';
            const cs5 = new pgp.helpers.ColumnSet(inOutCols, { table: 'transformation_output' });
            const outputQuery = pgp.helpers.insert(transformationOutputDB, cs5) + ' RETURNING *;';
            // * Execute queries. Insertion to the Transformation table must occur first
            // * because the input and output tables refer to the id of Transformation.
            const query1 = locationDB.length > 0 ? pgp.helpers.concat([upsert1, upsert2, insert]) : pgp.helpers.concat([upsert1, insert]);
            yield instance_1.db.many(query1).then(data => { return data; });
            const query2 = pgp.helpers.concat([inputQuery, outputQuery]);
            return yield instance_1.db.many(query2).then(data => { return data; });
        });
    }
    selectTransformationById(transformationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransformation, transformationId).then(transformation => { return transformation; });
        });
    }
    selectTransformationInputById(transformationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransformationInput, transformationId).then(transformation => { return transformation; });
        });
    }
    selectTransformationOutputById(transformationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransformationOutput, transformationId).then(transformation => { return transformation; });
        });
    }
    selectTransformations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransformations).then(transformations => { return transformations; });
        });
    }
    selectTransformationsByOwner(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransformationsByOwner, ownerId).then((transformations) => __awaiter(this, void 0, void 0, function* () { return transformations; }));
        });
    }
}
exports.TransformationRepo = TransformationRepo;
//# sourceMappingURL=transformationRepository.js.map