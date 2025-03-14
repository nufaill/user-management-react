import express from "express";
import { createUser, verifyLogin, getuserData, userLogout, updateUser } from "../Controllers/userController";
import multer from "multer";
import path from "path";
import auth from "../Middleware/userAuth";

const userRoute = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/images"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

// User routes
userRoute.post("/create", upload.single("image"), createUser);  
userRoute.post("/login", verifyLogin);  // User login
userRoute.get("/:id", getuserData);  // Get user details by ID
userRoute.post("/logout", auth.verifyUser, userLogout);
userRoute.put("/update/:id", auth.verifyUser, upload.single("image"), updateUser);

export default userRoute;
