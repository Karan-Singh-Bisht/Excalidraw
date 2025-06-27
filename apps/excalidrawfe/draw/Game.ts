import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "rect";
  private pencilPoints: { x: number; y: number }[] = []; // Fixed type
  private socket: WebSocket; // Fixed type

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket; // Fixed assignment
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  setShape(tool: "circle" | "rect" | "pencil") {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas(); // Call clearCanvas after loading shapes
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const shape: Shape = JSON.parse(message.message);
        this.existingShapes.push(shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    // Removed unnecessary parameters since we use class properties
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes?.map((shape) => {
      if (shape?.type === "rect") {
        this.ctx.strokeStyle = "rgba(255,255,255)";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape?.type === "circle") {
        this.ctx.strokeStyle = "rgba(255,255,255)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(
          shape?.centerX,
          shape?.centerY,
          Math.abs(shape?.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      } else if (shape?.type === "pencil") {
        this.ctx.strokeStyle = "rgba(255,255,255)";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        if (shape.points && shape.points.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
          for (let i = 1; i < shape.points.length; i++) {
            this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
          }
          this.ctx.stroke();
        }
      }
    });
  }

  mouseDownHandler = (e: any) => {
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    const selectedTool = this.selectedTool;

    // Initialize pencil drawing
    if (selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseMoveHandler = (e: any) => {
    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - this.startX;
    const height = currentY - this.startY;

    const selectedTool = this.selectedTool;

    if (selectedTool === "pencil") {
      // Add point to pencil path
      this.pencilPoints.push({ x: currentX, y: currentY });

      // Draw the current pencil stroke
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255,255,255)";
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (this.pencilPoints.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
        for (let i = 1; i < this.pencilPoints.length; i++) {
          this.ctx.lineTo(this.pencilPoints[i].x, this.pencilPoints[i].y);
        }
        this.ctx.stroke();
      }
    } else {
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255,255,255)";

      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = this.startX + (width < 0 ? -radius : radius);
        const centerY = this.startY + (height < 0 ? -radius : radius);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
  };

  mouseUpHandler = (e: any) => {
    if (!this.clicked) return;
    this.clicked = false;

    const rect = this.canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - this.startX;
    const height = endY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      const centerX = width < 0 ? this.startX - radius : this.startX + radius; // Fixed
      const centerY = height < 0 ? this.startY - radius : this.startY + radius; // Fixed
      shape = {
        type: "circle",
        centerX,
        centerY,
        radius,
      };
    } else if (selectedTool === "pencil") {
      this.pencilPoints.push({ x: endX, y: endY });
      shape = {
        type: "pencil",
        points: [...this.pencilPoints],
      };
      this.pencilPoints = [];
    }

    if (shape) {
      this.existingShapes.push(shape);
    }

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(shape),
        roomId: Number(this.roomId),
      })
    );
    this.clearCanvas();
  };

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    // Add mousemove handler for real-time drawing preview
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
