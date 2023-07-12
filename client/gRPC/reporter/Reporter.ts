// Original file: gRPC/reporter.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../google/protobuf/Empty';
import type { sendDataRequest as _reporter_sendDataRequest, sendDataRequest__Output as _reporter_sendDataRequest__Output } from '../reporter/sendDataRequest';

export interface ReporterClient extends grpc.Client {
  sendData(argument: _reporter_sendDataRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  sendData(argument: _reporter_sendDataRequest, callback: grpc.requestCallback<_google_protobuf_Empty__Output>): grpc.ClientUnaryCall;
  
}

export interface ReporterHandlers extends grpc.UntypedServiceImplementation {
  sendData: grpc.handleUnaryCall<_reporter_sendDataRequest__Output, _google_protobuf_Empty>;
  
}

export interface ReporterDefinition extends grpc.ServiceDefinition {
  sendData: MethodDefinition<_reporter_sendDataRequest, _google_protobuf_Empty, _reporter_sendDataRequest__Output, _google_protobuf_Empty__Output>
}
