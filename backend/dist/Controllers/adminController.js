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
exports.logoutAdmin = exports.deleteUser = exports.createUser = exports.updateUser = exports.editUser = exports.manageUsers = exports.getData = exports.adminLogin = void 0;
const userModels_1 = __importDefault(require("../Models/userModels"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const securePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcryptjs_1.default.hash(password, 10);
    }
    catch (error) {
        console.error("Password hashing error:", error);
        return ""; // Ensure a valid return type (avoid `undefined`)
    }
});
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const adminInfo = yield userModels_1.default.findOne({ email });
        if (!adminInfo || !adminInfo.isAdmin) {
            res.status(403).json({ message: "No access" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, adminInfo.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        const token = generateToken(adminInfo._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.status(200).json({
            message: "Login successful",
            _id: adminInfo._id,
            name: adminInfo.name,
            email: adminInfo.email,
            mobile: adminInfo.mobile,
            image: adminInfo.image,
            token,
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.adminLogin = adminLogin;
const getData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModels_1.default.find();
        res.status(200).json(users);
    }
    catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getData = getData;
const manageUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModels_1.default.find({ isAdmin: false }).select("-password");
        res.status(200).json(users);
    }
    catch (err) {
        console.error("Error managing users:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.manageUsers = manageUsers;
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModels_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.editUser = editUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, email, name, mobile } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;
        const user = yield userModels_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const updatedUser = yield userModels_1.default.findByIdAndUpdate(id, { name, email, mobile, image }, { new: true });
        res.status(200).json({ message: "Update successful", updatedUser });
    }
    catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateUser = updateUser;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, mobile } = req.body;
        const image = req.file ? `/uploads/images/${req.file.filename}` : undefined;
        if (yield userModels_1.default.findOne({ email })) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        const passwordHash = yield securePassword(password);
        if (!passwordHash) {
            res.status(500).json({ message: "Error hashing password" });
            return;
        }
        const user = yield userModels_1.default.create({ name, image, password: passwordHash, email, mobile });
        res.status(201).json(user);
    }
    catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createUser = createUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedUser = yield userModels_1.default.findByIdAndDelete(id);
        if (!deletedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteUser = deleteUser;
const logoutAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Server error during logout" });
    }
});
exports.logoutAdmin = logoutAdmin;
