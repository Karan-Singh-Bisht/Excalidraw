"use client";

import { innitDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconBar } from "./IconBar";
import { PencilIcon, RectangleHorizontal, Circle } from "lucide-react";

type shape = "circle" | "pencil" | "rect";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<shape>("rect");

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      innitDraw(canvas, roomId, socket);
    }
  }, [canvasRef]);

  useEffect(() => {
    //@ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  return (
    <div className="relative overflow-hidden">
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      ></canvas>
      <div className="absolute top-10 left-10">
        <ToolBar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />
      </div>
    </div>
  );
}

function ToolBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: shape;
  setSelectedTool: (s: shape) => void;
}) {
  return (
    <div className="flex gap-2">
      <IconBar
        activated={selectedTool === "pencil"}
        icon={<PencilIcon />}
        onClick={() => {
          setSelectedTool("pencil");
        }}
      />
      <IconBar
        activated={selectedTool === "rect"}
        icon={<RectangleHorizontal />}
        onClick={() => {
          setSelectedTool("rect");
        }}
      />
      <IconBar
        activated={selectedTool === "circle"}
        icon={<Circle />}
        onClick={() => {
          setSelectedTool("circle");
        }}
      />
    </div>
  );
}
