import { IVector } from "../interfaces/IVector";
import { IActor } from "../interfaces/IActor";

export abstract class Vector<K,V> implements IVector, Map<K, V> {
    private innerMap : Map<K,V>
    public readonly size : number

    constructor(M : Map<K, V>) {
        this.innerMap = M
        this.size = M.size
    }

    abstract Zero() : IVector
    abstract Add(x: IVector, y: IVector) : IVector
    abstract Mult(k: number, y: IVector) : IVector

    clear(): void { throw new Error("Vectors are immutable.") }
    delete(_key: K): boolean { throw new Error("Vectors are immutable.") }
    set(_key: K, _value: V): this { throw new Error("Vectors are immutable.") }
    
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        return this.innerMap.forEach(callbackfn, thisArg)
    }
    
    get(key: K): V {
        if (key.hasOwnProperty('id')) {
            for (let [k,v] of this.innerMap.entries()) {
                if ((k as IActor).id == (key as IActor).id) {
                    return v
                }
            }
            return null
        } else { return this.innerMap.get(key) }
    }

    has(key: K): boolean {
        if (key.hasOwnProperty('id')) {
            for (let [k,_] of this.innerMap.entries()) {
                if ((k as IActor).id == (key as IActor).id) {
                    return true
                }
            }
            return false
        } else { return this.innerMap.has(key) }
    }

    getKey(key: K): K | null {
        if (key.hasOwnProperty('id')) {
            for (let [k,_] of this.innerMap.entries()) {
                if ((k as IActor).id == (key as IActor).id) {
                    return k
                }
            }
            return null
        } else { return null }
    }

    keys(): IterableIterator<K> { return this.innerMap.keys() }
    entries(): IterableIterator<[K, V]> { return this.innerMap.entries() }
    values(): IterableIterator<V> { return this.innerMap.values() }
   
    [Symbol.iterator] () : IterableIterator<[K,V]> { return this.innerMap.entries() }
    [Symbol.toStringTag]: string

}