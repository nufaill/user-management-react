"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./Config/db"));
const userRoute_1 = __importDefault(require("./Routes/userRoute"));
const adminRoute_1 = __importDefault(require("./Routes/adminRoute"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: 'http://localhost:5173', // Adjust this to your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Global no-cache headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// Connect to the database
(0, db_1.default)();
// Serve static files from the uploads directory
app.use('/uploads/images', express_1.default.static(path_1.default.join(__dirname, 'uploads/images'))); // Serve uploaded images
// User routes
app.use("/user", userRoute_1.default);
// Admin routes
app.use("/admin", adminRoute_1.default); // Connect the admin routes
const port = Number(process.env.PORT) || 5010;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
