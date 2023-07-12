import { IHBFData } from "../hbf/interfaces";
import { render } from "mustache";

export class KubeManifest {

    private hbfData: IHBFData

    constructor(hbfData: IHBFData) {
        this.hbfData = hbfData
    }
}