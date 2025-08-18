// routes/userRoutes.js
const express = require("express");
const {
  verifyOTP,
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  resendOTP
} = require("../controllers/userController");
const authMiddleware = require("../middleware/user");
const upload = require("../middleware/userprofile");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);
router.get("/profile", authMiddleware, getProfile);

router.put(
  "/profile",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },   // Single profile image
    { name: "images", maxCount: 10 }  // Multiple gallery images
  ]),
  updateProfile
);

module.exports = router;
