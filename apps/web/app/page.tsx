"use client";

import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div
      style={{ display: "flex", gap: 2, justifyContent: "center" }}
      className={styles.page}
    >
      <input
        style={{ padding: 2 }}
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      ></input>
      <button
        style={{ padding: 2 }}
        onClick={() => router.push(`/room/${roomId}`)}
      >
        Join Room
      </button>
    </div>
  );
}
