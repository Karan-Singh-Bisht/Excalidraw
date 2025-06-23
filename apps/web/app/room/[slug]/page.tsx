import React from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import ChatRoom from "../../component/ChatRoom";

async function getRoom(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/api/v1/room/${slug}`);
  return response.data.id;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const roomId = await getRoom(slug);
  return (
    <>
      <ChatRoom id={roomId}></ChatRoom>
    </>
  );
}
