import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
const wss = new WebSocketServer({ port: 8080 });
import { JWT_SECRET } from "@repo/backend-common/config";

wss.on("connection", function connection(ws, request) {
  ws.on("error", console.error);

  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const decoded = jwt.verify(token, JWT_SECRET as string);

  if (!decoded || !(decoded as JwtPayload).userId) {
    ws.close(1008, "Invalid token");
    return;
  }

  ws.send("something");
});
