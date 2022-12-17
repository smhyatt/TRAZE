"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
class Vector {
    constructor(M) {
        Object.defineProperty(this, "innerMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _a, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.innerMap = M;
        this.size = M.size;
    }
    clear() { throw new Error("Vectors are immutable."); }
    delete(_key) { throw new Error("Vectors are immutable."); }
    set(_key, _value) { throw new Error("Vectors are immutable."); }
    forEach(callbackfn, thisArg) {
        return this.innerMap.forEach(callbackfn, thisArg);
    }
    get(key) {
        if (key.hasOwnProperty('id')) {
            for (let [k, v] of this.innerMap.entries()) {
                if (k.id == key.id) {
                    return v;
                }
            }
            return null;
        }
        else {
            return this.innerMap.get(key);
        }
    }
    has(key) {
        if (key.hasOwnProperty('id')) {
            for (let [k, _] of this.innerMap.entries()) {
                if (k.id == key.id) {
                    return true;
                }
            }
            return false;
        }
        else {
            return this.innerMap.has(key);
        }
    }
    getKey(key) {
        if (key.hasOwnProperty('id')) {
            for (let [k, _] of this.innerMap.entries()) {
                if (k.id == key.id) {
                    return k;
                }
            }
            return null;
        }
        else {
            return null;
        }
    }
    keys() { return this.innerMap.keys(); }
    entries() { return this.innerMap.entries(); }
    values() { return this.innerMap.values(); }
    [Symbol.iterator]() { return this.innerMap.entries(); }
}
exports.Vector = Vector;
_a = Symbol.toStringTag;
//# sourceMappingURL=vector.js.map