"use client";

import { innitDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      innitDraw(canvas);
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef}></canvas>;
}
