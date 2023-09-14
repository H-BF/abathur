// Original file: gRPC/control.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Req as _control_Req, Req__Output as _control_Req__Output } from '../control/Req';
import type { Res as _control_Res, Res__Output as _control_Res__Output } from '../control/Res';

export interface ControlClient extends grpc.Client {
  streamApi(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamApi(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamApi(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamApi(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  
  streamFunc(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamFunc(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamFunc(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamFunc(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  
}

export interface ControlHandlers extends grpc.UntypedServiceImplementation {
  streamApi: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
  streamFunc: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
}

export interface ControlDefinition extends grpc.ServiceDefinition {
  streamApi: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
  streamFunc: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
}
