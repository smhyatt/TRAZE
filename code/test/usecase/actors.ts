const agentsInput : ReadonlyArray<{name:string,type:string}> = [
    { name: 'Ernesto Cárdenas', type: 'FARMER' },
    { name: 'APECAFEQ', type: 'COOPERATIVE' },
    { name: 'Almacafé', type: 'DRY_MILL' },
]

const locationsInput : ReadonlyArray<{name:string, coordinates: {longitude:number, latitude:number}}> = [
    { name: 'Sixaraca coffee farm', coordinates: { longitude: 5.341439931123682, latitude: -75.70315061621802 } },
    { name: 'APECAFEQ', coordinates: { longitude: 5.337467738489806, latitude: -75.72929847025421 } },
    { name: 'Almacafé', coordinates: { longitude: 5.431017944832946, latitude: -75.70456715715554 } },
]

export { agentsInput, locationsInput }