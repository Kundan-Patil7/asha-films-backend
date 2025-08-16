const multer = require("multer");
const path = require("path");
const fs = require("fs");

const clientDir = path.join(process.cwd(), "uploads", "clients");
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, clientDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // ✅ Prefix with fieldname
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});

const clientUpload = upload.fields([
  { name: "image", maxCount: 1 },   // Single profile image
  { name: "images", maxCount: 80 }, // Multiple gallery images
]);

module.exports = clientUpload;
