import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ReporterClient as _reporter_ReporterClient, ReporterDefinition as _reporter_ReporterDefinition } from './reporter/Reporter';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Empty: MessageTypeDefinition
    }
  }
  reporter: {
    Reporter: SubtypeConstructor<typeof grpc.Client, _reporter_ReporterClient> & { service: _reporter_ReporterDefinition }
    sendDataRequest: MessageTypeDefinition
  }
}

