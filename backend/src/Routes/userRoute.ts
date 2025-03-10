import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { createUser, verifyLogin, getuserData, userLogout, updateUser } from "../Controllers/userController";
import verifyUser from "../Middleware/userAuth"; 
const userRoute = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, path.join(__dirname, '../uploads/images'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const name = `${Date.now()}-${file.originalname}`;
        cb(null, name);
    }
});

const upload = multer({ storage });

// User routes
userRoute.post("/create", upload.single("image"), createUser); // User registration with image upload
userRoute.post("/login", verifyLogin); // User login
userRoute.get("/:id", getuserData); // Get user details by ID
userRoute.post("/logout", verifyUser, userLogout); // ✅ Use function directly
userRoute.put("/update/:id", verifyUser, upload.single("image"), updateUser); // ✅ Use function directly

export default userRoute;
