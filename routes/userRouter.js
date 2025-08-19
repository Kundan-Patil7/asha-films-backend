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
const combinedUpload = require("../middleware/userprofile")
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
  combinedUpload.fields([
    { name: "image", maxCount: 1 },           // single profile image
    { name: "images", maxCount: 10 },         // multiple gallery images
    { name: "headshot_image", maxCount: 1 },  // headshot
    { name: "full_image", maxCount: 1 },      // full body
    { name: "audition_video", maxCount: 1 }   // audition video
  ]),
  updateProfile
);



module.exports = router;
