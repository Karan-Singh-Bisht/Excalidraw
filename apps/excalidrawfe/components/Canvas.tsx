import { innitDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      innitDraw(canvas, roomId, socket);
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div className=" absolute w-full bottom-0 bg-gray-200 px-2">
        <button className="w-[33.3%] border-2 hover:cursor-pointer">
          Rect
        </button>
        <button className="w-[33.3%] border-2 hover:cursor-pointer">
          Circle
        </button>
        <button className="w-[33.3%] border-2 hover:cursor-pointer">
          Square
        </button>
      </div>
    </div>
  );
}
