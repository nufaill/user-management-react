import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../Models/userModels";

dotenv.config();

// Extend Request to include user object
interface AuthRequest extends Request {
  user?: IUser;
}

const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;
    console.log("Token from cookie:", token);

    if (!token) {
      console.log("No token in cookies");
      res.status(401).json({ success: false, message: "Not authorized, no token" });
      return; // Ensure the function exits
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Get user details excluding password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    // Verify if user is admin
    if (!user.isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized as admin" });
      return;
    }

    // Attach user to request
    req.user = user;
    console.log("Authenticated admin:", req.user);

    next(); // Call `next()` correctly after authentication
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

export default verifyAdmin;
