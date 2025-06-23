"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";

export function ChatRoomClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chats, setChats] = useState(messages);
  const { socket, loading } = useSocket();
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    const joinMessage = JSON.stringify({
      type: "joinRoom",
      roomId: id,
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(joinMessage);
    } else {
      socket.addEventListener("open", () => socket.send(joinMessage));
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats((prev) => [...prev, { message: parsedData.message }]);
        } else if (parsedData.type === "info") {
          console.log("Info:", parsedData.message);
        } else if (parsedData.type === "error") {
          console.error("Error:", parsedData.message);
        }
      } catch (err) {
        console.warn("Received non-JSON message:", event.data);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, id]);
  return (
    <div>
      {chats?.map((message, index) => <div key={index}>{message.message}</div>)}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      ></input>
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );
          setCurrentMessage("");
        }}
      >
        Send Message
      </button>
    </div>
  );
}
