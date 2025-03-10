import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../Models/userModels";

dotenv.config();

interface AuthRequest extends Request {
  user?: IUser; // Extend Request type to include user
}

const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token; // Get the token from cookies

  if (!token) {
    console.log("No token provided");
    res.status(401).json({ message: "Not authorized, no token" });
    return; // Ensure function exits
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Find user by ID, excluding password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Attach user info to the request object
    req.user = user;

    next(); // Call next() after successful authentication
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default verifyUser; // ✅ Export directly as default function
