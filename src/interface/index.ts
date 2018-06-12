export interface Connector {
  resolve: Function | undefined
  reject: Function | undefined
}

export enum MessageType {
  SYN = 'SYN',
  MSG = 'MSG',
  PSH = 'PSH',
  ACK = 'ACK',
}

export enum HostNode {
  Prefix = 'Host-'
}

export enum ConnStatus {
  Success = -1000,
  Failed = -2000,
}

export interface Procedures {
  [key: number]: Connector
}

export interface RemoteCall {
  method: string
  params?: any[]
  // version: number
}

export type RemoteSchema<T> = {
  [K in keyof T]: T[K] extends (...params: any[]) => Promise<infer U>
    ? U extends HTMLElement
        ? (...params: any[]) => string
        : (...params: any[]) => U
    : (...params: any[]) => T[K]
}
