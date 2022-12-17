"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
// Unique identifier generators
const short = require('short-uuid');
const { v4: uuidv4 } = require('uuid');
class Agent {
    constructor(name, type, id, key) {
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
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.type = type;
        (id == undefined) ? this.id = uuidv4() : this.id = id;
        (key == undefined) ? this.key = short.generate() : this.key = key;
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map