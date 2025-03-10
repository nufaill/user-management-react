import multer from "multer";
import path from "path";

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req: any, _file: any, cb: (arg0: null, arg1: string) => void) {
        cb(null, "uploads/images/"); // Uploads will be stored in 'uploads/images' folder
    },
    filename: function (req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
    },
});

// File filter: Allow only images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter,
});

export default upload;
