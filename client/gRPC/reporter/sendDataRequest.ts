// Original file: gRPC/reporter.proto

import type { Long } from '@grpc/proto-loader';

export interface _reporter_sendDataRequest_Result {
  'msg'?: (string);
  'srcIp'?: (string);
  'srcPort'?: (string);
  'dstIp'?: (string);
  'dstPort'?: (string);
  'protocol'?: (string);
}

export interface _reporter_sendDataRequest_Result__Output {
  'msg'?: (string);
  'srcIp'?: (string);
  'srcPort'?: (string);
  'dstIp'?: (string);
  'dstPort'?: (string);
  'protocol'?: (string);
}

export interface sendDataRequest {
  'duration'?: (number | string | Long);
  'node'?: (string);
  'results'?: (_reporter_sendDataRequest_Result)[];
}

export interface sendDataRequest__Output {
  'duration'?: (Long);
  'node'?: (string);
  'results'?: (_reporter_sendDataRequest_Result__Output)[];
}
