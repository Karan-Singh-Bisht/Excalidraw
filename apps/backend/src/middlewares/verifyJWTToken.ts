import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

const verifyJWTToken = (req: Request, res: Response, next: NextFunction) => {
  // Extract token from cookie or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("JWT verification failed:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default verifyJWTToken;
