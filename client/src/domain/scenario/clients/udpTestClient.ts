import { TResult } from "../../interfaces";
import { ITestClient } from "./test.client.interface";

export class UdpTestClient implements ITestClient {

    private srcIp: string
    private testResults: TResult[] = [];
    passCount: number = 0
    failCount: number = 0

    constructor(srcIp: string) {
        this.srcIp = srcIp
    }

    async runTests() {}

    getResults() {}
}