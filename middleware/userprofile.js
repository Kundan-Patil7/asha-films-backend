// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const profileDir = path.join(process.cwd(), "uploads", "profiles");

// if (!fs.existsSync(profileDir)) {
//   fs.mkdirSync(profileDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, profileDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `profile-${Date.now()}${ext}`;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB max
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Only .jpg, .jpeg, .png files are allowed"));
//     }
//   }
// });

// module.exports = upload;
