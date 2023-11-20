export interface ITestClient {
    runTests: (data: any[]) => Promise<void>
    getResults: () => void
}