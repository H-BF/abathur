import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { HBFTestClient as _HBFTest_HBFTestClient, HBFTestDefinition as _HBFTest_HBFTestDefinition } from './HBFTest/HBFTest';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  HBFTest: {
    HBFTest: SubtypeConstructor<typeof grpc.Client, _HBFTest_HBFTestClient> & { service: _HBFTest_HBFTestDefinition }
    pingResponse: MessageTypeDefinition
  }
  google: {
    protobuf: {
      Empty: MessageTypeDefinition
    }
  }
}

