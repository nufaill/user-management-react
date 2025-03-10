import { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../Models/userModels";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const securePassword = async (password: string): Promise<string | undefined> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error(error);
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    const existingMobileUser = mobile ? await User.findOne({ mobile }) : null;
    if (existingMobileUser) {
      res.status(400).json({ message: "User with this mobile number already exists" });
      return;
    }

    const hashedPassword = await securePassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      image: req.file ? `/uploads/images/${req.file.filename}` : null,
      isAdmin: false,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error in user creation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!user.password) {
      console.error("User found but password is undefined:", user);
      res.status(500).json({ message: "Server error" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "30d" });

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getuserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const userLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, mobile } = req.body;
    const { id } = req.params;

    let updatedData: Record<string, any> = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (mobile) updatedData.mobile = mobile;

    if (req.file) {
      updatedData.image = `/uploads/images/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
