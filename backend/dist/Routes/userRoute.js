"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../Controllers/userController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const userAuth_1 = __importDefault(require("../Middleware/userAuth"));
const userRoute = express_1.default.Router();
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../uploads/images"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// User routes
userRoute.post("/create", upload.single("image"), userController_1.createUser); // User registration with image upload
userRoute.post("/login", userController_1.verifyLogin); // User login
userRoute.get("/:id", userController_1.getuserData); // Get user details by ID
userRoute.post("/logout", userAuth_1.default.verifyUser, userController_1.userLogout);
userRoute.put("/update/:id", userAuth_1.default.verifyUser, upload.single("image"), userController_1.updateUser);
exports.default = userRoute;
