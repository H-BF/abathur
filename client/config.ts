import { variables } from "./src/infrastructure/var_storage/variables-storage"

export const CONTROL_IP = variables.get("ABA_CONTROL_IP")
export const CONTROL_PORT = variables.get("ABA_CONTROL_PORT")

export const CONTROL_PROTO_PATH = '../../../../gRPC/control.proto'