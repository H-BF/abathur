// Original file: gRPC/reporter.proto


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
  'node'?: (string);
  'results'?: (_reporter_sendDataRequest_Result)[];
}

export interface sendDataRequest__Output {
  'node'?: (string);
  'results'?: (_reporter_sendDataRequest_Result__Output)[];
}
