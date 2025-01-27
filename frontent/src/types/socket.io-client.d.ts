import { Socket as SocketIOClient } from 'socket.io-client';

declare module 'socket.io-client' {
  export const io: (url: string, opts?: any) => SocketIOClient;
  export type Socket = SocketIOClient;
}