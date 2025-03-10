import express, { Request } from "express";
import multer from "multer";
import path from "path";
import verifyAdmin from "../Middleware/adminAuth";
import {
    adminLogin,
    getData,
    editUser,
    updateUser,
    createUser,
    deleteUser,
    logoutAdmin,
    manageUsers,
} from "../Controllers/adminController";

const adminRouter = express.Router();

// Multer storage setup for image uploads
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, path.join(__dirname, "../Multer/images"));
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Public route - No authentication needed
adminRouter.post("/login", adminLogin);

// Protected routes - Require admin authentication
adminRouter.get("/manage-users", verifyAdmin, manageUsers);
adminRouter.get("/data", verifyAdmin, getData);
adminRouter.get("/editUser/:id", verifyAdmin, editUser);
adminRouter.put("/update", verifyAdmin, upload.single("image"), updateUser);
adminRouter.post("/create", verifyAdmin, upload.single("image"), createUser);
adminRouter.delete("/delete/:id", verifyAdmin, deleteUser);
adminRouter.post("/logout", verifyAdmin, logoutAdmin);

export default adminRouter;