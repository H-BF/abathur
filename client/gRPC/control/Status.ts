// Original file: gRPC/control.proto

export const Status = {
  ready: 1,
  finish: 2,
  error: 3,
} as const;

export type Status =
  | 'ready'
  | 1
  | 'finish'
  | 2
  | 'error'
  | 3

export type Status__Output = typeof Status[keyof typeof Status]
