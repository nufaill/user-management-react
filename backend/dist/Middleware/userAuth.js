"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../Models/userModels"));
dotenv_1.default.config();
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token; // Get the token from cookies
    if (!token) {
        console.log("No token provided");
        res.status(401).json({ message: "Not authorized, no token" });
        return; // Ensure function exits
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find user by ID, excluding password
        const user = yield userModels_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        // Attach user info to the request object
        req.user = user;
        next(); // Call next() after successful authentication
    }
    catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
});
exports.default = verifyUser; // ✅ Export directly as default function
