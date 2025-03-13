import express, { Request, Response } from "express";
import User, { IUser } from "../Models/userModels";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const securePassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Password hashing error:", error);
    return ""; // Ensure a valid return type (avoid `undefined`)
  }
};

const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const adminInfo: IUser | null = await User.findOne({ email });
    console.log("Admin Info:", adminInfo);

    if (!adminInfo || !adminInfo.isAdmin) {
      res.status(403).json({ message: "No access" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, adminInfo.password);
    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", adminInfo.password);
    console.log("Password Match:", isPasswordValid);
        if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = generateToken(adminInfo._id);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });

    res.status(200).json({
      message: "Login successful",
      _id: adminInfo._id,
      name: adminInfo.name,
      email: adminInfo.email,
      mobile: adminInfo.mobile,
      image: adminInfo.image,
      token,
    });

    if (!isPasswordValid) {
      console.log("Password validation failed");
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    
    console.log("Login successful, generating token...");
    console.log("Token generated:", token);

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: IUser[] = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const manageUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: IUser[] = await User.find({ isAdmin: false }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error managing users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser | null = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, email, name, mobile } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user: IUser | null = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(id, { name, email, mobile, image }, { new: true });
    res.status(200).json({ message: "Update successful", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, mobile } = req.body;
    const image = req.file ? `/uploads/images/${req.file.filename}` : undefined;

    if (await User.findOne({ email })) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const passwordHash = await securePassword(password);
    if (!passwordHash) {
      res.status(500).json({ message: "Error hashing password" });
      return;
    }

    const user: IUser = await User.create({ name, image, password: passwordHash, email, mobile });
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};