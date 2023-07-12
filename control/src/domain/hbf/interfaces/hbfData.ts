export interface IHBFData {
    sgFrom: string
    cidrFrom: string[]
    sgTo: string
    ciderTo: string[]
    transport: string
    ports: {
        s: string
        d: string
    }[]
}