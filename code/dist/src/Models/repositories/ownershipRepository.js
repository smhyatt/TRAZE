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
exports.OwnershipRepo = void 0;
const pgp = require('pg-promise')({
    capSQL: true // ! Obs. capslock has to be on
});
const instance_1 = require("../database/instance");
const { createOwnership, getOwnerships, delOwnership, getOwnershipstate } = require('../database/queries');
class OwnershipRepo {
    selectOwnerships() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getOwnerships).then(data => { return data; });
        });
    }
    insertOwnership(ownership) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(createOwnership, ownership).then(data => { return data; });
        });
    }
    insertOwnershipMulti(ownershipArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const cols = ['agent', 'type', 'amount'];
            const cs = new pgp.helpers.ColumnSet(cols, { table: 'ownership' });
            const query = pgp.helpers.insert(ownershipArr, cs);
            return yield instance_1.db.many(query).then(() => 'OK');
        });
    }
    delOwnership(ownership) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.none(delOwnership, ownership).then(() => 'OK');
        });
    }
    getOwnershipstate() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getOwnershipstate).then(data => { return data; });
        });
    }
}
exports.OwnershipRepo = OwnershipRepo;
//# sourceMappingURL=ownershipRepository.js.map