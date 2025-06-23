import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhNzc4ZjNkLTFkZTUtNGFlZC1iOTcxLWU1ODU5NjU3ZDQzZCIsImlhdCI6MTc1MDQzNDk2NywiZXhwIjoxNzUwNTIxMzY3fQ.j-mbNzGtK4ZJHnFX1qoWPR2pdw-T0VQsCt8OTZDsK-U`
    );
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
