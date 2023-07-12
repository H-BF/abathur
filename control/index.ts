import { HBFDataCollector } from "./src/domain/hbf";

(async () => {
    const hbf = new HBFDataCollector()
    const hbfData =  await hbf.collect()
    console.log(hbfData)
})();