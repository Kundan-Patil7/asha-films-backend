const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ARTIST_DIR = path.join(process.cwd(), "uploads", "artists");

// Ensure directory exists
if (!fs.existsSync(ARTIST_DIR)) {
  fs.mkdirSync(ARTIST_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ARTIST_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const artistUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    }
  },
});

module.exports = artistUpload;
