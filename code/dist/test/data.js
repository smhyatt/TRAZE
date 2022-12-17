"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsInput = exports.resourceTypesTransformation = exports.resourceTypesInput = exports.resourcesInput = exports.agentsInputCS = exports.agentsInput = void 0;
const agentsInput = [
    { name: 'Ernesto Cárdenas', type: 'FARMER' },
    { name: 'Cooperativa de Caficultores de Antioquia', type: 'COOPERATIVE' },
    { name: 'Almacafé', type: 'DRY_MILL' },
    { name: 'Amacafé Exportación', type: 'EXPORTER' },
    { name: 'Löfberg Import', type: 'IMPORTER' },
    { name: 'Löfberg', type: 'ROASTER' }
];
exports.agentsInput = agentsInput;
const agentsInputCS = [
    { name: 'Grace Hopper', type: 'Computer Scientist, Mathematician and first programmer' },
    { name: 'Margaret Hamilton', type: 'Software Engineer' },
    { name: 'Ada Lovelace', type: 'Proposed the mechanical general-purpose computer' }
];
exports.agentsInputCS = agentsInputCS;
const resourcesInput = [
    { amount: 100, type: 'USD' },
    { amount: 1.00000, type: 'BTC' },
    { amount: 120000, type: 'Apple' },
    { amount: 0, type: 'Water' },
    { amount: 3.00000, type: 'Gold' }
];
exports.resourcesInput = resourcesInput;
const resourceTypesInput = [
    { name: 'DKK', valuation: 100 },
    { name: 'BTC', valuation: 50000 },
    { name: 'Raw Metal', valuation: 80.765 },
    { name: 'Water', valuation: 5.9 },
    // { name: 'USD', valuation: 10000 },
    // { name: 'Apple', valuation: 60 },
    // { name: 'Gold', valuation: 1000 },
];
exports.resourceTypesInput = resourceTypesInput;
const resourceTypesTransformation = [
    { name: 'Screws', valuation: 10 },
    { name: 'WoodenPlank', valuation: 2000 },
    { name: 'TableLeg', valuation: 1000 },
    { name: 'Table', valuation: 16200 },
    { name: 'Once Upon a Time in Hollywood', valuation: 200 },
    { name: 'Camilla', valuation: 1000000000000 }
];
exports.resourceTypesTransformation = resourceTypesTransformation;
const locationsInput = [
    { name: 'Farm', coordinates: { longitude: 1, latitude: 1 } },
    { name: 'Checkpoint', coordinates: { longitude: 2.5, latitude: 2 } }
];
exports.locationsInput = locationsInput;
//# sourceMappingURL=data.js.map