import { variables } from "../src/infrastructure/var_storage/variables-storage"

export const HBF_PROTOCOL = "http"
export const HBF_HOST = `p${variables.get("PIPELINE_ID")}-hbf-server`
export const HBF_PORT = "80"