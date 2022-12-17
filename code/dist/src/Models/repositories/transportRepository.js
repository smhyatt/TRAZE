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
exports.TransportRepo = void 0;
const pgp = require('pg-promise')({
    capSQL: true // ! Obs caplock has to be on. 
});
const instance_1 = require("../database/instance");
const { getTransport, getTransports, getTransportLocation, getTransportsByAgent } = require('../database/queries');
class TransportRepo {
    buildInsert(table, columns, data) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table });
        return pgp.helpers.insert(data, columnSet) + ' RETURNING *;';
    }
    buildUpsert(table, columns, data, v1, v2, skip) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table });
        const onConflict = ` ON CONFLICT(${v1}, ${v2}) DO UPDATE SET ` +
            columnSet.assignColumns({ from: 'EXCLUDED', skip: skip });
        return pgp.helpers.insert(data, columnSet) + onConflict;
    }
    addTransport(transportRows, resourceLocationRows) {
        return __awaiter(this, void 0, void 0, function* () {
            const transportColumns = ['id', 'owner', 'location_start', 'destination', 'resource_type', 'amount', 'time_of_effect', 'distance'];
            const insertTransport = this.buildInsert('transport', transportColumns, transportRows);
            const resourceLocationColumns = ['location_id', 'resource_type', 'amount'];
            const lid = 'location_id';
            const rt = 'resource_type';
            const skip = [lid, rt];
            const upsertLocationState = this.buildUpsert('location_state', resourceLocationColumns, resourceLocationRows, lid, rt, skip);
            const query = pgp.helpers.concat([
                upsertLocationState,
                insertTransport,
            ]);
            return yield instance_1.db.many(query).then(data => { return data; });
        });
    }
    selectTransportById(transportId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransport, transportId).then(transport => { return transport; });
        });
    }
    selectTransportsByAgent(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransportsByAgent, agentId).then(transports => {
                function distanceNotZero(transport) { return (transport.distance > 0); }
                return transports.filter(distanceNotZero);
            });
        });
    }
    selectTransports() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransports).then(transports => { return transports; });
        });
    }
    selectLocationFromTransport(owner, rtype) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.manyOrNone(getTransportLocation, [owner, rtype]).then(id => { return id; });
        });
    }
}
exports.TransportRepo = TransportRepo;
//# sourceMappingURL=transportRepository.js.map