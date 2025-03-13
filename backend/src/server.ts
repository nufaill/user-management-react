import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import connectDB from './Config/db';  
import userRoute from './Routes/userRoute';
import adminRoute from './Routes/adminRoute'; 

const app: Application = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Adjust this to your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Global no-cache headers
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Connect to the database
connectDB();

// Serve static files from the uploads directory
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images'))); // Serve uploaded images

// User routes
app.use("/user", userRoute);

// Admin routes
app.use("/admin", adminRoute); // Connect the admin routes

const port: number = Number(process.env.PORT) || 5010;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
