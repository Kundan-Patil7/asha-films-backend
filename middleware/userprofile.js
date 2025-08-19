// middleware/combinedUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folder if not exists
const uploadDir = path.join(__dirname, "..", "uploads", "user_media");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Combined storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Combined file filter for both images and videos
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png"];
  const videoTypes = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
  const allowedTypes = [...imageTypes, ...videoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image (jpg, jpeg, png) and video (mp4, mkv, avi, mov) formats are allowed."), false);
  }
};

// Combined upload middleware
const combinedUpload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB for videos, will work for images too
  },
  fileFilter
});

module.exports = combinedUpload;