const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;

// OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ===================== REGISTER PRODUCTION HOUSE =====================
const registerProductionHouse = async (req, res) => {
  try {
    const {
      gst_no,
      pan_no,
      aadhaar_no,
      company_name,
      type_of_work,
      email,
      phone_number,
      password,
    } = req.body;

    if (
      !gst_no ||
      !pan_no ||
      !aadhaar_no ||
      !company_name ||
      !type_of_work ||
      !email ||
      !phone_number ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS production_house (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gst_no VARCHAR(50) NOT NULL,
        pan_no VARCHAR(50) NOT NULL,
        aadhaar_no VARCHAR(50) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        type_of_work VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        otp_code VARCHAR(6) NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(createTableQuery);

    const [existing] = await db.query(
      `SELECT * FROM production_house WHERE email = ? OR phone_number = ?`,
      [email, phone_number]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email or Phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 11);
    const otp = generateOTP();

    await db.query(
      `INSERT INTO production_house (gst_no, pan_no, aadhaar_no, company_name, type_of_work, email, phone_number, password, otp_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gst_no,
        pan_no,
        aadhaar_no,
        company_name,
        type_of_work,
        email,
        phone_number,
        hashedPassword,
        otp,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Production House registered successfully. Please verify OTP.",
      otp, // remove in production
    });
  } catch (error) {
    console.error("❌ registerProductionHouse error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
const loginProductionHouse = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email or phone
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password required",
      });
    }

    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE email = ? OR phone_number = ?`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    const prod = rows[0];
    if (!prod.verified) {
      return res
        .status(403)
        .json({ success: false, message: "Please verify your account first" });
    }

    const isMatch = await bcrypt.compare(password, prod.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: prod.id, email: prod.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      production_house: {
        id: prod.id,
        company_name: prod.company_name,
        email: prod.email,
        phone_number: prod.phone_number,
      },
    });
  } catch (error) {
    console.error("❌ loginProductionHouse error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY OTP =====================
const verifyProductionHouseOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const [rows] = await db.query(
      `SELECT otp_code FROM production_house WHERE email = ?`,
      [email]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });

    if (rows[0].otp_code !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    await db.query(
      `UPDATE production_house SET verified = 1, otp_code = NULL WHERE email = ?`,
      [email]
    );

    res
      .status(200)
      .json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("❌ verifyProductionHouseOTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
const forgotProductionHousePassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE email = ?`,
      [email]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });

    const otp = generateOTP();
    await db.query(`UPDATE production_house SET otp_code = ? WHERE email = ?`, [
      otp,
      email,
    ]);

    res.status(200).json({
      success: true,
      message: "OTP sent (for demo returned in response)",
      otp, // remove in production
    });
  } catch (error) {
    console.error("❌ forgotProductionHousePassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
const resetProductionHousePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 11);

    const [result] = await db.query(
      `UPDATE production_house SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ resetProductionHousePassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== GET PROFILE =====================
const getProductionHouseProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    const prod = rows[0];
    delete prod.password;
    delete prod.otp_code;

    if (prod.image) {
      prod.image = `${req.protocol}://${req.get("host")}/uploads/production/${
        prod.image
      }`;
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched",
      production_house: prod,
    });
  } catch (error) {
    console.error("❌ getProductionHouseProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE PROFILE =====================
const updateProductionHouseProfile = async (req, res) => {
  try {




    
    const id = req.user.id;
    const updates = { ...req.body };

   console.log(id);
    console.log(req.body);

    // Fields you should never allow to update here
    const restricted = [
      "id",
      "email",
      "password",
      "otp_code",
      "verified",
      "created_at",
      "updated_at",
    ];
    restricted.forEach((f) => delete updates[f]);

    // If there's a new image uploaded, handle old image removal and update image field
    if (req.file) {
      // Fetch old image filename to delete from server
      const [rows] = await db.query(
        "SELECT image FROM production_house WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      const oldImage = rows[0].image;
      if (oldImage) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "production",
          oldImage
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update image filename in updates
      updates.image = req.file.filename;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    const setClause = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db.query(`UPDATE production_house SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    const [updated] = await db.query(
      `SELECT * FROM production_house WHERE id = ?`,
      [id]
    );
    delete updated[0].password;
    delete updated[0].otp_code;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      production_house: updated[0],
    });
  } catch (error) {
    console.error("❌ updateProductionHouseProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerProductionHouse,
  loginProductionHouse,
  verifyProductionHouseOTP,
  forgotProductionHousePassword,
  resetProductionHousePassword,
  getProductionHouseProfile,
  updateProductionHouseProfile,
};
