// Original file: gRPC/HBFTest.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../google/protobuf/Empty';
import type { pingResponse as _HBFTest_pingResponse, pingResponse__Output as _HBFTest_pingResponse__Output } from '../HBFTest/pingResponse';

export interface HBFTestClient extends grpc.Client {
  ping(argument: _google_protobuf_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _google_protobuf_Empty, callback: grpc.requestCallback<_HBFTest_pingResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface HBFTestHandlers extends grpc.UntypedServiceImplementation {
  ping: grpc.handleUnaryCall<_google_protobuf_Empty__Output, _HBFTest_pingResponse>;
  
}

export interface HBFTestDefinition extends grpc.ServiceDefinition {
  ping: MethodDefinition<_google_protobuf_Empty, _HBFTest_pingResponse, _google_protobuf_Empty__Output, _HBFTest_pingResponse__Output>
}
