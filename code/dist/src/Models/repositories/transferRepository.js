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
exports.TransferRepo = void 0;
const pgp = require('pg-promise')({
    capSQL: true // ! Obs caplock has to be on. 
});
const instance_1 = require("../database/instance");
const { getTransfer, selectTransferByAgentId } = require('../database/queries');
class TransferRepo {
    // * By grouping the queries we increase performance drastically, since one connection
    // * to the database is opened to perform all queries at once. 
    // * The first insert adds to the transfer table, while the upsert on the ownership table.
    addTransfer(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transferDB: transferDB, ownershipDB: ownershipDB } = input;
            // * Generate insertion to Transfer. 
            const transCols = ['id', 'transferor', 'transferee', 'type', 'amount', 'time_of_effect', 'info'];
            const cs1 = new pgp.helpers.ColumnSet(transCols, { table: 'transfer' });
            const insert = pgp.helpers.insert(transferDB, cs1) + ' RETURNING *;';
            // * The Ownership table might already have the agent and resource type registered, 
            // * so we do an UPSERT, to update instead, when the agent and type already exist.
            const ownerCols = ['agent', 'type', 'amount'];
            const cs2 = new pgp.helpers.ColumnSet(ownerCols, { table: 'ownership' });
            const onConflict = ' ON CONFLICT(agent, type) DO UPDATE SET ' +
                cs2.assignColumns({ from: 'EXCLUDED', skip: ['agent', 'type'] });
            const upsert = pgp.helpers.insert(ownershipDB, cs2) + onConflict; // * Generates upsert
            const query = pgp.helpers.concat([upsert, insert]);
            return yield instance_1.db.many(query).then(data => { return data; });
        });
    }
    selectTransferById(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getTransfer, transferId).then(transfer => { return transfer; });
        });
    }
    selectTransferByAgentId(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(selectTransferByAgentId, agent).then(transfers => { return transfers; });
        });
    }
}
exports.TransferRepo = TransferRepo;
//# sourceMappingURL=transferRepository.js.map