import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import {
  CreateUserSchema,
  LoginUserSchema,
  CreateRoomSchema,
} from "@repo/common/types";

export const signUpController = async (req: Request, res: Response) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.issues.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    const { username, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prismaClient.user.findFirst({
      where: {
        OR: [{ email }, { name: username }],
      },
    });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prismaClient.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const signInController = async (req: Request, res: Response) => {
  try {
    const parsed = LoginUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }
    const { email, password } = parsed.data;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await prismaClient.user.findFirst({
      where: { email },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid email" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
