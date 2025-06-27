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
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | null;

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
  let pencilPoints: { x: number; y: number }[] = []; // For storing pencil path

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    //@ts-ignore
    const selectedTool = window.selectedTool;

    // Initialize pencil drawing
    if (selectedTool === "pencil") {
      pencilPoints = [{ x: startX, y: startY }];
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - startX;
    const height = endY - startY;

    //@ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      const centerX = width < 0 ? startX - radius : startX + radius;
      const centerY = height < 0 ? startY - radius : startY + radius;
      shape = {
        type: "circle",
        centerX,
        centerY,
        radius,
      };
    } else if (selectedTool === "pencil") {
      // Add final point and create pencil shape
      pencilPoints.push({ x: endX, y: endY });
      shape = {
        type: "pencil",
        points: [...pencilPoints],
      };
      pencilPoints = []; // Reset for next drawing
    }

    if (shape) {
      existingShapes.push(shape);
    }

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

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startX;
    const height = currentY - startY;

    //@ts-ignore
    const selectedTool = window.selectedTool;

    if (selectedTool === "pencil") {
      // Add point to pencil path
      pencilPoints.push({ x: currentX, y: currentY });

      // Draw the current pencil stroke
      clearCanvas(existingShapes, ctx, canvas);
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (pencilPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pencilPoints[0].x, pencilPoints[0].y);
        for (let i = 1; i < pencilPoints.length; i++) {
          ctx.lineTo(pencilPoints[i].x, pencilPoints[i].y);
        }
        ctx.stroke();
      }
    } else {
      clearCanvas(existingShapes, ctx, canvas);
      ctx.strokeStyle = "rgba(255,255,255)";

      if (selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = startX + (width < 0 ? -radius : radius);
        const centerY = startY + (height < 0 ? -radius : radius);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
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

  existingShapes?.map((shape) => {
    if (shape?.type === "rect") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.lineWidth = 1;
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape?.type === "circle") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        shape?.centerX,
        shape?.centerY,
        Math.abs(shape?.radius),
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else if (shape?.type === "pencil") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape.points && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      }
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
