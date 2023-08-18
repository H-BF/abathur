import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { ControlClient as _control_ControlClient, ControlDefinition as _control_ControlDefinition } from './control/Control';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  control: {
    Control: SubtypeConstructor<typeof grpc.Client, _control_ControlClient> & { service: _control_ControlDefinition }
    Req: MessageTypeDefinition
    Res: MessageTypeDefinition
    Status: EnumTypeDefinition
  }
}

