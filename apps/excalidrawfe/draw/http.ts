import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const response = await axios.get(
    `http://localhost:3001/api/v1/room/get-all-chats/${roomId}`
  );
  const messages = response.data;
  const shapes = messages?.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });
  return shapes;
}
