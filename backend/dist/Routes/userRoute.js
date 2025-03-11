"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const userController_1 = require("../Controllers/userController");
const userAuth_1 = __importDefault(require("../Middleware/userAuth"));
const userRoute = express_1.default.Router();
// Define the upload folder path
const uploadFolder = path_1.default.join(process.cwd(), "uploads/images");
// Ensure the folder exists
if (!fs_1.default.existsSync(uploadFolder)) {
    fs_1.default.mkdirSync(uploadFolder, { recursive: true });
}
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const name = `${Date.now()}-${file.originalname}`;
        cb(null, name);
    }
});
const upload = (0, multer_1.default)({ storage });
// User routes
userRoute.post("/create", upload.single("image"), userController_1.createUser); // User registration with image upload
userRoute.post("/login", userController_1.verifyLogin); // User login
userRoute.get("/:id", userController_1.getuserData); // Get user details by ID
userRoute.post("/logout", userAuth_1.default, userController_1.userLogout); // ✅ Use function directly
userRoute.put("/update/:id", userAuth_1.default, upload.single("image"), userController_1.updateUser); // ✅ Use function directly
exports.default = userRoute;
