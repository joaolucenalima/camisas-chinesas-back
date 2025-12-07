import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

export let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket) => {
    console.log("Cliente conectado");

    socket.on("close", () => console.log("Cliente desconectado"));
  });

  return wss;
}

export function broadcast(message: string) {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}
