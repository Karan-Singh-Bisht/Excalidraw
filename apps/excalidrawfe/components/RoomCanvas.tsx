"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    ws.onopen = () => {
      setSocket(ws);
      console.log("Joining....");
      ws.send(
        JSON.stringify({
          type: "joinRoom",
          roomId: roomId,
        })
      );
    };
  }, []);

  if (!socket) {
    return <div>Connection to server....</div>;
  }

  return (
    <div className="relative">
      <Canvas roomId={roomId} socket={socket}></Canvas>
    </div>
  );
}
