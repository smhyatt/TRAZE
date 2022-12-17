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
exports.ResourceTypeRepo = void 0;
const pgp = require('pg-promise')({ capSQL: true }); // ! Obs. capslock has to be on
const instance_1 = require("../database/instance");
const { getResourceType, getResourceTypes, getResourceTypeBasedOnType, deleteResourceTypeById, } = require('../database/queries');
class ResourceTypeRepo {
    addResourceType(rtypeArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const cols = ['id', 'name', 'valuation'];
            const cs = new pgp.helpers.ColumnSet(cols, { table: 'resource_type' });
            const query = pgp.helpers.insert(rtypeArr, cs) + ' RETURNING *;';
            return yield instance_1.db.many(query).then(data => { return data; });
        });
    }
    selectResourceTypeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getResourceType, id).then(resourceType => { return resourceType; });
        });
    }
    selectResourceTypeByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.one(getResourceTypeBasedOnType, name).then(resourceType => { return resourceType; });
        });
    }
    selectResourceTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(getResourceTypes).then(resourceTypes => { return resourceTypes; });
        });
    }
    deleteResourceTypeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield instance_1.db.any(deleteResourceTypeById, id).then(res => { return res; });
        });
    }
}
exports.ResourceTypeRepo = ResourceTypeRepo;
//# sourceMappingURL=resourceRepository.js.map