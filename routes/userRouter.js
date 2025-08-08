const express = require("express");
const {
  verifyOTP,
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/user");
const upload = require("../middleware/userprofile");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  upload.single("profile_image"),
  updateProfile
);

module.exports = router;
