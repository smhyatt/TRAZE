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
exports.RetireCCCRepo = void 0;
const pgp = require('pg-promise')({ capSQL: true });
const instance_1 = require("../database/instance");
const { getRetiredById, getAllRetired } = require('../database/queries');
class RetireCCCRepo {
    buildInsert(table, columns, data) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table });
        return pgp.helpers.insert(data, columnSet) + ' RETURNING *;';
    }
    buildUpsert(table, columns, data) {
        const columnSet = new pgp.helpers.ColumnSet(columns, { table: table });
        const onConflict = ' ON CONFLICT(agent, type) DO UPDATE SET ' +
            columnSet.assignColumns({ from: 'EXCLUDED', skip: ['agent', 'type'] });
        return pgp.helpers.insert(data, columnSet) + onConflict;
    }
    addRetireTransfer(retireRows, ownershipRows) {
        return __awaiter(this, void 0, void 0, function* () {
            const retireColumns = ['id', 'transferor', 'type', 'amount', 'time_of_effect'];
            const insertRetire = this.buildInsert('cc_retire', retireColumns, retireRows);
            const ownershipColumns = ['agent', 'type', 'amount'];
            const upsertOwnership = this.buildUpsert('ownership', ownershipColumns, ownershipRows);
            const query = pgp.helpers.concat([
                upsertOwnership,
                insertRetire,
            ]);
            return yield instance_1.db.many(query).then(data => { return data; });
        });
    }
    selectRetiredById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getRetiredById, id).then(transfer => { return transfer; });
        });
    }
    selectAllRetired() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getAllRetired).then(ts => { return ts; });
        });
    }
}
exports.RetireCCCRepo = RetireCCCRepo;
//# sourceMappingURL=retireCCCRepository.js.map