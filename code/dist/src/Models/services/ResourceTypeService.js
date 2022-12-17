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
exports.ResourceTypeService = void 0;
const resourceType_1 = require("../classes/resourceType");
class ResourceTypeService {
    constructor(rtr) {
        Object.defineProperty(this, "resourceTypeRepo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.resourceTypeRepo = rtr;
    }
    selectResourceTypes(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.resourceTypeRepo.selectResourceTypes()
                .then(rts => { return res.send(rts); })
                .catch(error => { return res.status(400).send({ error: "Error selecting resource types.", msg: error }); });
        });
    }
    selectResourceTypeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.resourceTypeRepo.selectResourceTypeById(id)
                .then(rts => { return res.send(rts); })
                .catch(error => { return res.status(400).send({ error: "Error selecting resource types.", msg: error }); });
        });
    }
    insertResourceTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rtypes } = req.body;
            const rtypeArr = [];
            rtypes.forEach(rtype => {
                rtypeArr.push(new resourceType_1.ResourceType(rtype.name, rtype.valuation));
            });
            yield this.resourceTypeRepo.addResourceType(rtypeArr)
                .then(rt => { return res.send(rt); })
                .catch(error => { return res.status(400).send({ error: "Error inserting resource type.", msg: error }); });
        });
    }
}
exports.ResourceTypeService = ResourceTypeService;
//# sourceMappingURL=ResourceTypeService.js.map