import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { z } from "zod/v4";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signUpController = async (req: Request, res: Response) => {
  try {
    const parsed = signUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { username, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

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
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signInController = async (req: Request, res: Response) => {
  try {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }
    const { email, password } = parsed.data;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
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
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
