export interface IScenarioInterface {
    failCount: number
    passCount: number
    start: () => void
    isFinish: () => boolean
}