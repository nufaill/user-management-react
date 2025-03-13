import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../Models/userModels";
import { RequestHandler } from "express";


interface DecodedToken {
    id: string;
}

interface AuthenticatedRequest extends Request {
    user?: any;
}
const verifyAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {  // Explicitly return void
    try {
        const token = req.cookies?.token;
        console.log("Token from cookie:", token);

        if (!token) {
            console.log("No token in cookies");
            res.status(401).json({
                success: false,
                message: "Not authorized, no token"
            });
            return;  // Ensure function ends
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        
        // Get user details excluding password
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // Verify if user is admin
        if (!user.isAdmin) {
            res.status(403).json({
                success: false,
                message: "Not authorized as admin"
            });
            return;
        }

        // Attach user to request
        req.user = user;
        console.log("Authenticated admin:", req.user);
        next();  // No return needed
    } catch (error) {
        console.error("Admin verification error:", error);
        res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        });
        return;
    }
};


export default verifyAdmin;