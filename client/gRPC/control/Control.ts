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
  
  streamChangeIp(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamChangeIp(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamChangeIp(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamChangeIp(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  
  streamIcmp(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamIcmp(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamIcmp(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamIcmp(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  
  streamSimpleFunc(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamSimpleFunc(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamSimpleFunc(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  streamSimpleFunc(options?: grpc.CallOptions): grpc.ClientDuplexStream<_control_Req, _control_Res__Output>;
  
}

export interface ControlHandlers extends grpc.UntypedServiceImplementation {
  streamApi: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
  streamChangeIp: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
  streamIcmp: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
  streamSimpleFunc: grpc.handleBidiStreamingCall<_control_Req__Output, _control_Res>;
  
}

export interface ControlDefinition extends grpc.ServiceDefinition {
  streamApi: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
  streamChangeIp: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
  streamIcmp: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
  streamSimpleFunc: MethodDefinition<_control_Req, _control_Res, _control_Req__Output, _control_Res__Output>
}
