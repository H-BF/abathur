import { SimpleFuncType } from "../enums/simple.func.types"

export interface IStreamSimpleFuncList {
    [SimpleFuncType.S2S]: Set<string>,
    [SimpleFuncType.S2F]: Set<string>,
    [SimpleFuncType.S2C]: Set<string>,
    [SimpleFuncType.C2S]: Set<string>
    [SimpleFuncType.S2S_IE]: Set<string>
}

export interface ITestPodClientCount {
    [SimpleFuncType.S2S]: number,
    [SimpleFuncType.S2F]: number,
    [SimpleFuncType.S2C]: number,
    [SimpleFuncType.C2S]: number
    [SimpleFuncType.S2S_IE]: number
}