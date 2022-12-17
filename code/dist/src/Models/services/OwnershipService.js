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
exports.OwnershipService = void 0;
class OwnershipService {
    constructor(or) {
        Object.defineProperty(this, "ownershipRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.ownershipRepo = or;
    }
    selectOwnerships(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ownershipRepo.selectOwnerships()
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: "Error getting ownerships from db", msg: error }); });
        });
    }
    getOwnershipstate(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ownershipRepo.getOwnershipstate()
                .then(data => { return res.send(data); })
                .catch(error => { return res.status(400).send({ error: "Error getting ownerships from db", msg: error }); });
        });
    }
}
exports.OwnershipService = OwnershipService;
//# sourceMappingURL=OwnershipService.js.map