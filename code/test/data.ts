const agentsInput : ReadonlyArray<{name:string,type:string}> = [
    { name: 'Ernesto Cárdenas', type: 'FARMER' },
    { name: 'Cooperativa de Caficultores de Antioquia', type: 'COOPERATIVE' },
    { name: 'Almacafé', type: 'DRY_MILL' },
    { name: 'Amacafé Exportación', type: 'EXPORTER' },
    { name: 'Löfberg Import', type: 'IMPORTER' },
    { name: 'Löfberg', type: 'ROASTER' }
]

const agentsInputCS : ReadonlyArray<{name:string,type:string}> = [
    { name: 'Grace Hopper', type: 'Computer Scientist, Mathematician and first programmer' },
    { name: 'Margaret Hamilton', type: 'Software Engineer' },
    { name: 'Ada Lovelace', type: 'Proposed the mechanical general-purpose computer' }
]

const resourcesInput : ReadonlyArray<{amount: number, type: string}> = [
    { amount: 100, type: 'USD' },
    { amount: 1.00000, type: 'BTC' },
    { amount: 120000, type: 'Apple' },
    { amount: 0, type: 'Water' },
    { amount: 3.00000, type: 'Gold' }
]

const resourceTypesInput : ReadonlyArray<{name: string, valuation: number}> = [
    { name: 'DKK', valuation: 100 },
    { name: 'BTC', valuation: 50000 },
    { name: 'Raw Metal', valuation: 80.765 },
    { name: 'Water', valuation: 5.9 },
    // { name: 'USD', valuation: 10000 },
    // { name: 'Apple', valuation: 60 },
    // { name: 'Gold', valuation: 1000 },
]

const resourceTypesTransformation : ReadonlyArray<{name: string, valuation: number}> = [
    { name: 'Screws', valuation: 10 },
    { name: 'WoodenPlank', valuation: 2000 },
    { name: 'TableLeg', valuation: 1000 },
    { name: 'Table', valuation: 16200 },
    { name: 'Once Upon a Time in Hollywood', valuation: 200 },
    { name: 'Camilla', valuation: 1000000000000 }
]

const locationsInput : ReadonlyArray<{name:string, coordinates: {longitude:number, latitude:number}}> = [
    { name: 'Farm', coordinates: { longitude: 1, latitude: 1 } },
    { name: 'Checkpoint', coordinates: { longitude: 2.5, latitude: 2 } }
]

export { 
    agentsInput, 
    agentsInputCS,
    resourcesInput, 
    resourceTypesInput,
    resourceTypesTransformation,
    locationsInput,
}