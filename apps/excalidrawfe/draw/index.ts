import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function innitDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  clearCanvas(existingShapes, ctx, canvas);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    const shape: Shape = JSON.parse(message.message);
    existingShapes.push(shape);
    clearCanvas(existingShapes, ctx, canvas);
  };

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    const shape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    };

    existingShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(shape),
        roomId: Number(roomId),
      })
    );
    clearCanvas(existingShapes, ctx, canvas);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    clearCanvas(existingShapes, ctx, canvas);
    ctx.strokeStyle = "rgba(255,255,255)";
    ctx.strokeRect(startX, startY, width, height);
  });
}

function clearCanvas(
  existingShapes: Shape[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes?.map((shape, index) => {
    if (shape?.type === "rect") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId: string) {
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
