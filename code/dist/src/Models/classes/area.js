"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Area = void 0;
class Area {
    constructor(area) {
        Object.defineProperty(this, "area", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.area = area;
    }
    toString() {
        let s = "area: { ";
        this.area.forEach(l => s = `${s}(${l.longitude}, ${l.latitude}), `);
        return `${s.slice(0, -2)} }`;
    }
    print() { console.log(this.toString()); }
}
exports.Area = Area;
//# sourceMappingURL=area.js.map