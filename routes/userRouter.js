const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/user");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
