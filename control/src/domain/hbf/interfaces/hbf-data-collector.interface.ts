export interface IHBFDataCollector {
    collect(): void
    convert(): void
    get(): any
}