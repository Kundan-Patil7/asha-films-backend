const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Function to create table if it doesn't exist
const createUsersTable = async () => {
  const createQuery = `
  CREATE TABLE IF NOT EXISTS users_full_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pan_no VARCHAR(20) NOT NULL UNIQUE,
    aadhar_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    plan ENUM('free', 'premium') DEFAULT 'free',
    suspended BOOLEAN DEFAULT FALSE,
    suspended_from DATETIME NULL,
    suspended_to DATETIME NULL,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;

  await db.query(createQuery);
};

// User Registration
const registerUser = async (req, res) => {
  try {
    const { pan_no, aadhar_no, name, email, mobile, password } = req.body;

    await createUsersTable();

    // Check if email or mobile already exists
    const [existing] = await db.query(
      "SELECT * FROM users_full_profile WHERE email = ? OR mobile = ?",
      [email, mobile]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email or Mobile already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.query(
      "INSERT INTO users_full_profile (pan_no, aadhar_no, name, email, mobile, password) VALUES (?, ?, ?, ?, ?, ?)",
      [pan_no, aadhar_no, name, email, mobile, hashedPassword]
    );

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users_full_profile WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

    const [rows] = await db.query(
      "SELECT id, pan_no, aadhar_no, name, email, mobile, plan, suspended, suspended_from, suspended_to, blocked, created_at, updated_at FROM users_full_profile WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
