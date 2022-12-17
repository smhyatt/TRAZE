"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = void 0;
const { v4: uuidv4 } = require('uuid');
class ResourceType {
    constructor(name, valuation, id) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "valuation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.valuation = valuation;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
    }
}
exports.ResourceType = ResourceType;
//# sourceMappingURL=resourceType.js.map