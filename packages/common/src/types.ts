import { z } from "zod/v4";

export const CreateUserSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  username: z.string().min(1, "Username is required"),
});

export const LoginUserSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const CreateRoomSchema = z.object({
  roomName: z.string().min(1, "Room name is required"),
});
