// Original file: gRPC/control.proto

export const Status = {
  ready: 1,
  finish: 2,
} as const;

export type Status =
  | 'ready'
  | 1
  | 'finish'
  | 2

export type Status__Output = typeof Status[keyof typeof Status]
