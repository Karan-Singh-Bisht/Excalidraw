import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { SocketManager } from "./SocketManager";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    return decoded.id;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
  return null;
}

wss.on("connection", function connection(ws, request) {
  ws.on("error", console.error);

  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close(1008, "Unauthorized");
    return;
  }

  //Register user
  const socketManager = SocketManager.getInstance();
  socketManager.addUser(userId, ws);
  console.log(`user ${userId} connected`);

  //Handle incoming messages
  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString()); // Parse the incoming message
      const socketManager = SocketManager.getInstance();

      switch (parsed.type) {
        case "joinRoom":
          socketManager.joinRoom(userId, parsed.roomId);
          ws.send(
            JSON.stringify({
              type: "info",
              message: `Joined Room ${parsed.roomId}`,
            })
          );
          break;

        case "leaveRoom":
          socketManager.leaveRoom(userId, parsed.roomId);
          ws.send(
            JSON.stringify({
              type: "info",
              message: `Left Room ${parsed.roomId}`,
            })
          );
          break;

        case "chat":
          await prismaClient.chat.create({
            data: {
              roomId: parsed.roomId,
              message: parsed.message,
              userId,
            },
          });
          socketManager.broadcastToRoom(
            parsed.roomId,
            JSON.stringify({
              from: userId,
              message: parsed.message,
              roomId: parsed.roomId,
            })
          );
          break;

        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            })
          );
      }
    } catch (err) {
      console.error("Error parsing message:", err);
      ws.send("Error processing message");
    }
  });

  ws.on("close", () => {
    socketManager.removeUser(userId);
    console.log(`user ${userId} disconnected`);
  });

  ws.send(
    JSON.stringify({
      type: "info",
      message: "Connection established",
    })
  );
});
