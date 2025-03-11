"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const adminAuth_1 = __importDefault(require("../Middleware/adminAuth"));
const adminController_1 = require("../Controllers/adminController");
const adminRouter = express_1.default.Router();
// Multer storage setup for image uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../Multer/images"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
// Public route - No authentication needed
adminRouter.post("/login", adminController_1.adminLogin);
// Protected routes - Require admin authentication
adminRouter.get("/manage-users", adminAuth_1.default, adminController_1.manageUsers);
adminRouter.get("/data", adminAuth_1.default, adminController_1.getData);
adminRouter.get("/editUser/:id", adminAuth_1.default, adminController_1.editUser);
adminRouter.put("/update", adminAuth_1.default, upload.single("image"), adminController_1.updateUser);
adminRouter.post("/create", adminAuth_1.default, upload.single("image"), adminController_1.createUser);
adminRouter.delete("/delete/:id", adminAuth_1.default, adminController_1.deleteUser);
adminRouter.post("/logout", adminAuth_1.default, adminController_1.logoutAdmin);
exports.default = adminRouter;
