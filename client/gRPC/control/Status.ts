// Original file: gRPC/control.proto

export const Status = {
  ready: 1,
  next: 2,
  finish: 3,
  error: 4,
} as const;

export type Status =
  | 'ready'
  | 1
  | 'next'
  | 2
  | 'finish'
  | 3
  | 'error'
  | 4

export type Status__Output = typeof Status[keyof typeof Status]
