import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/types";

export const createRoom = async (req: Request, res: Response) => {
  const userId = req.userId;
  const parsed = CreateRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      errors: parsed.error.issues.map((err: any) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }
  const { roomName } = parsed.data;
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: roomName,
        adminId: userId as string,
      },
    });
    if (!room) {
      res.status(500).json({ error: "Failed to create room" });
      return;
    }
    res.status(201).json({
      message: "Room created successfully",
      room: {
        id: room.id,
        slug: room.slug,
        adminId: room.adminId,
      },
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
