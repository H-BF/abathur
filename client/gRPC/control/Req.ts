// Original file: gRPC/control.proto

import type { Status as _control_Status, Status__Output as _control_Status__Output } from '../control/Status';

export interface Req {
  'status'?: (_control_Status);
  'data'?: (string);
}

export interface Req__Output {
  'status'?: (_control_Status__Output);
  'data'?: (string);
}
