import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../Models/userModels";

interface DecodedToken {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

const verifyUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
      return; // Ensure the function exits
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    // Fetch user details excluding password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return; // Ensure the function exits
    }

    req.user = user; // Attach user to request
    next(); // Call next() to proceed
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const auth = {
  verifyUser,
};

export default auth;
