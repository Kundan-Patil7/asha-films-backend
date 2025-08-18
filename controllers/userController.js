const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;

// OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ===================== REGISTER =====================
const registerUser = async (req, res) => {
  try {
    const { pan_no, aadhaar_no, name, email, mobile, password } = req.body;

    if (!pan_no || !aadhaar_no || !name || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        plan ENUM('free', 'premium') DEFAULT 'free',
        suspended BOOLEAN DEFAULT FALSE,
        suspended_from DATETIME NULL,
        suspended_to DATETIME NULL,
        blocked BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(6) NULL,
        is_verified BOOLEAN DEFAULT 0,
        pan_no VARCHAR(50) NOT NULL UNIQUE ,
        aadhaar_no VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255)  NULL,
        middle_name VARCHAR(255) NULL,
        last_name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
        current_location VARCHAR(255) NULL,
        country VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        city VARCHAR(100) NULL,
        nationality VARCHAR(100) NULL,
        passport BOOLEAN DEFAULT FALSE,
        driver_license BOOLEAN DEFAULT FALSE,
        cinta_card VARCHAR(50) NULL,
        height INT NULL,
        weight INT NULL,
        shoe_size VARCHAR(10) NULL,
        language VARCHAR(255) NULL,
        hobbies TEXT NULL,
        sports TEXT NULL,
        body_type VARCHAR(100) NULL,
        skin_tone VARCHAR(100) NULL,
        moustache VARCHAR(100) NULL,
        hair_length VARCHAR(100) NULL,
        hair_color VARCHAR(100) NULL,
        beard VARCHAR(100) NULL,
        tattoo_piercing VARCHAR(100) NULL,
        measurement VARCHAR(255) NULL,
        eye_color VARCHAR(100) NULL,
        distinctive_features TEXT NULL,
        disabilities TEXT NULL,
        cup_size VARCHAR(50) NULL,
        above_bust VARCHAR(50) NULL,
        bust VARCHAR(50) NULL,
        under_bust VARCHAR(50) NULL,
        waist VARCHAR(50) NULL,
        lower_waist VARCHAR(50) NULL,
        hips VARCHAR(50) NULL,
        arm_hole VARCHAR(50) NULL,
        biceps VARCHAR(50) NULL,
        shoulder VARCHAR(50) NULL,
        sleeve_length VARCHAR(50) NULL,
        trouser_length VARCHAR(50) NULL,
        inseam_length VARCHAR(50) NULL,
        upper_thigh VARCHAR(50) NULL,
        till_elbow VARCHAR(50) NULL,
        lower_thigh VARCHAR(50) NULL,
        collar VARCHAR(50) NULL,
        fork VARCHAR(50) NULL,
        two_wheeler BOOLEAN DEFAULT FALSE,
        four_wheeler BOOLEAN DEFAULT FALSE,
        lead_roles BOOLEAN DEFAULT FALSE,
        supporting_roles BOOLEAN DEFAULT FALSE,
        background_extras BOOLEAN DEFAULT FALSE,
        child_roles BOOLEAN DEFAULT FALSE,
        elderly_roles BOOLEAN DEFAULT FALSE,
        romantic_roles BOOLEAN DEFAULT FALSE,
        villain_roles BOOLEAN DEFAULT FALSE,
        comedy_roles BOOLEAN DEFAULT FALSE,
        period_roles BOOLEAN DEFAULT FALSE,
        fantasy_sci_fi_roles BOOLEAN DEFAULT FALSE,
        special_category BOOLEAN DEFAULT FALSE,
        special_niche VARCHAR(255) NULL,
        plus_size_model BOOLEAN DEFAULT FALSE,
        petite_model BOOLEAN DEFAULT FALSE,
        lgbtq_friendly BOOLEAN DEFAULT FALSE,
        theatre BOOLEAN DEFAULT FALSE,
        print_modeling BOOLEAN DEFAULT FALSE,
        reality_shows BOOLEAN DEFAULT FALSE,
        imdb_profile VARCHAR(255) NULL,
        acting_experience TEXT NULL,
        professional_training TEXT NULL,
        instagram_link VARCHAR(255) NULL,
        influencer_type VARCHAR(255) NULL,
        influencer_niche VARCHAR(255) NULL,
        agency_name VARCHAR(255) NULL,
        manager_name VARCHAR(255) NULL,
        hand_modeling BOOLEAN DEFAULT FALSE,
        foot_modeling BOOLEAN DEFAULT FALSE,
        body_double BOOLEAN DEFAULT FALSE,
        body_double_actor_name VARCHAR(255) NULL,
        lookalike_actor_name VARCHAR(255) NULL,
        skills TEXT NULL,
        image VARCHAR(255) NULL,
        images JSON NULL,
        availabilities TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await db.query(createUserTable);

    const [existingUsers] = await db.query(
      `SELECT * FROM users WHERE email = ? OR mobile = ?`,
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email or mobile already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 11);
    const otp = generateOTP();

    await db.query(
      `INSERT INTO users (pan_no, aadhaar_no, name, email, mobile, password, otp_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pan_no, aadhaar_no, name, email, mobile, hashedPassword, otp]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify OTP.",
      otp, // remove in production
    });
  } catch (error) {
    console.error("❌ registerUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE PROFILE =====================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };

    const restricted = [
      "id",
      "email",
      "password",
      "otp_code",
      "is_verified",
      "created_at",
      "updated_at",
    ];
    restricted.forEach((f) => delete updates[f]);

    // Handle single image upload
    if (req.files && req.files.image) {
      const [rows] = await db.query("SELECT image FROM users WHERE id = ?", [
        userId,
      ]);
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const oldImage = rows[0].image;
      if (oldImage) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "profiles",
          oldImage
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updates.image = req.files.image[0].filename;
    }

    // Handle multiple images upload (append mode)
    if (req.files && req.files.images) {
      const [rows] = await db.query("SELECT images FROM users WHERE id = ?", [
        userId,
      ]);

      let currentImages = [];
      if (rows[0].images) {
        currentImages = JSON.parse(rows[0].images);
      }

      const newImages = req.files.images.map((file) => file.filename);
      updates.images = JSON.stringify([...currentImages, ...newImages]);
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    const setClause = Object.keys(updates)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [
      ...values,
      userId,
    ]);

    const [updatedUser] = await db.query(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);
    delete updatedUser[0].password;
    delete updatedUser[0].otp_code;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOTP();
    await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
      otp,
      email,
    ]);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email (for demo returning in response)",
      otp, // remove in production
    });
  } catch (error) {
    console.error("❌ forgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // "identifier" can be either email or mobile

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Mobile and password are required",
      });
    }

    // Find user by email OR mobile
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ? OR mobile = ?`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // Check verification / suspension / block status
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }
    if (user.suspended || user.blocked) {
      return res.status(403).json({
        success: false,
        message: "Account suspended or blocked",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
     
    });
  } catch (error) {
    console.error("❌ loginUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY OTP =====================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const [rows] = await db.query(
      `SELECT otp_code FROM users WHERE email = ?`,
      [email]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (rows[0].otp_code !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    await db.query(
      `UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?`,
      [email]
    );

    res
      .status(200)
      .json({ success: true, message: "User verified successfully" });
  } catch (error) {
    console.error("❌ verifyOTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 11);

    const [result] = await db.query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ resetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== GET PROFILE =====================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const user = rows[0];
    delete user.password;
    delete user.otp_code;

    // Single image URL
    if (user.image) {
      user.image = `${req.protocol}://${req.get("host")}/uploads/profiles/${
        user.image
      }`;
    }

    // Multiple images URLs
    if (user.images) {
      try {
        const parsedImages = JSON.parse(user.images);
        if (Array.isArray(parsedImages)) {
          user.images = parsedImages.map(
            (img) =>
              `${req.protocol}://${req.get("host")}/uploads/profiles/${img}`
          );
        }
      } catch (err) {
        user.images = [];
      }
    }

    res.status(200).json({ success: true, message: "Profile fetched", user });
  } catch (error) {
    console.error("❌ getProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP in database
    await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
      otp,
      email,
    ]);

    // In production, you would send OTP via email/SMS here
    // For demo purposes, returning OTP in response
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      otp, // remove in production
    });
  } catch (error) {
    console.error("❌ resendOTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE PROFILE =====================

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  getProfile,
  updateProfile,
  resetPassword,
  resendOTP,
};
