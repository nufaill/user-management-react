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
exports.loginUser = exports.registerUser = void 0;
const userModels_1 = __importDefault(require("../Models/userModels"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield userModels_1.default.create({ name, email, password: hashedPassword });
        res.status(201).json({ message: "User Registered", user });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userModels_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        if (!user.password) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ message: "Login Successful", token });
    }
    catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
});
exports.loginUser = loginUser;
