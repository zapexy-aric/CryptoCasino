import { storage } from "./storage";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: typeof users.$inferSelect) {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token) as { id: string; iat: number; exp: number };

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
    const user = (req as any).user;
    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}
