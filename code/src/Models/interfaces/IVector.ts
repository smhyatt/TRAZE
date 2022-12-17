export interface IVector {
    Zero() : IVector
    Add(x: IVector, y: IVector) : IVector
    Mult(k: number, y: IVector) : IVector
}
