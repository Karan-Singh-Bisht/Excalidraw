import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      userId?: string | JwtPayload;
    }
  }
}

const verifyJWTToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized - Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
    };
    req.userId = decoded.id;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    console.error("JWT verification failed:", err);
    res.status(403).json({ error: "Invalid token" });
    return;
  }
};

export default verifyJWTToken;
