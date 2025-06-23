import axios from "axios";
import { BACKEND_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats({ roomId }: { roomId: string }) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/room/get-all-chats/${roomId}`
  );
  return response.data;
}

export default async function ChatRoom({ id }: { id: string }) {
  const messages = await getChats({ roomId: id });
  return <ChatRoomClient id={id} messages={messages} />;
}
