import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/server";
import { HttpStatus } from "@repo/dto";

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    req.user = { userId: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
};