"use client";

import { innitDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconBar } from "./IconBar";
import { PencilIcon, RectangleHorizontal, Circle } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "pencil" | "rect";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [game, setGame] = useState<Game>();

  //Effects run twice in dev mode so to show canvas only once we destroy one canvas and render the other one

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);
      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  useEffect(() => {
    game?.setShape(selectedTool);
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
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
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
