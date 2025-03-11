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
exports.updateUser = exports.userLogout = exports.getuserData = exports.verifyLogin = exports.createUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../Models/userModels"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const securePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcryptjs_1.default.hash(password, 10);
    }
    catch (error) {
        console.error(error);
    }
});
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email, and password are required" });
            return;
        }
        const existingUser = yield userModels_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User with this email already exists" });
            return;
        }
        const existingMobileUser = mobile ? yield userModels_1.default.findOne({ mobile }) : null;
        if (existingMobileUser) {
            res.status(400).json({ message: "User with this mobile number already exists" });
            return;
        }
        const hashedPassword = yield securePassword(password);
        const newUser = new userModels_1.default({
            name,
            email,
            password: hashedPassword,
            mobile,
            image: req.file ? `/uploads/images/${req.file.filename}` : null,
            isAdmin: false,
        });
        yield newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    }
    catch (error) {
        console.error("Error in user creation:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createUser = createUser;
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = yield userModels_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        if (!user.password) {
            console.error("User found but password is undefined:", user);
            res.status(500).json({ message: "Server error" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "30d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.verifyLogin = verifyLogin;
const getuserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield userModels_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getuserData = getuserData;
const userLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error during logout" });
    }
});
exports.userLogout = userLogout;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, mobile } = req.body;
        const { id } = req.params;
        let updatedData = {};
        if (name)
            updatedData.name = name;
        if (email)
            updatedData.email = email;
        if (mobile)
            updatedData.mobile = mobile;
        if (req.file) {
            updatedData.image = `/uploads/images/${req.file.filename}`;
        }
        const updatedUser = yield userModels_1.default.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateUser = updateUser;
