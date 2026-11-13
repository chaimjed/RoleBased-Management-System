import { io, Socket } from "socket.io-client";

export function createNotificationSocket(token: string): Socket {
  return io(`http://localhost:3000/notifications`, {
    auth: { token },
    autoConnect: true,
  });
}