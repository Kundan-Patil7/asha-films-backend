const express = require("express");
const {
  verifyOTP,
  loginUser,
  registerUser,
  getProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/user");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOTP);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
