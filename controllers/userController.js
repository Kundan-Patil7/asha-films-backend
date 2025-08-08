const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Use environment variables for production secrets
const JWT_SECRET = process.env.JWT_SECRET;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  try {
    const { pan_no, aadhaar_no, name, email, mobile, password } = req.body;

    // 1️⃣ Validate required fields
    if (!pan_no || !aadhaar_no || !name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Ensure 'users' table exists first
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
        pan_no VARCHAR(50) NOT NULL,
        aadhaar_no VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        middle_name VARCHAR(255) NULL,
        last_name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
        current_location VARCHAR(255) NULL,
        country VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        city VARCHAR(100) NULL,
        village VARCHAR(100) NULL,
        passport VARCHAR(50) NULL,
        driver_license VARCHAR(50) NULL,
        cinta_card VARCHAR(50) NULL,
        height INT NULL,
        weight INT NULL,
        shoe_size VARCHAR(10) NULL,
        nationality VARCHAR(100) NULL,
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
        availabilities TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await db.query(createUserTable);

    // 3️⃣ Check if user already exists
    const [existingUsers] = await db.query(
      `SELECT * FROM users WHERE email = ? OR mobile = ?`,
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // If same email → update OTP
      if (existingUser.email === email) {
        const otp = generateOTP();
        await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
          otp,
          email,
        ]);
        return res.status(200).json({
          message:
            "User already registered. A new OTP has been sent. Please verify.",
          otp, // Remove in production
        });
      } else {
        return res
          .status(409)
          .json({ message: "Mobile number already registered." });
      }
    }

    // 4️⃣ Register new user
    const hashedPassword = await bcrypt.hash(password, 11);
    const otp = generateOTP();

    await db.query(
      `INSERT INTO users (pan_no, aadhaar_no, name, email, mobile, password, otp_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pan_no, aadhaar_no, name, email, mobile, hashedPassword, otp]
    );

    res.status(201).json({
      message: "User registered successfully. Please verify OTP.",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 1️⃣ Find the user
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 2️⃣ Check if verified
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your account with the OTP before logging in.",
      });
    }

    // 3️⃣ Check if suspended or blocked
    if (user.suspended || user.blocked) {
      return res.status(403).json({
        message:
          "Your account has been suspended or blocked. Please contact support.",
      });
    }

    // 4️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    // 6️⃣ Prepare safe user data
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      mobile: user.mobile,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // 1️⃣ Get stored OTP
    const [rows] = await db.query(
      "SELECT otp_code FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const storedOTP = rows[0].otp_code;

    // 2️⃣ Check OTP
    if (storedOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 3️⃣ Mark user as verified
    await db.query("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("❌ verifyOTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Provided by authentication middleware

    // 1️⃣ Fetch user profile
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const user = rows[0];

    // 2️⃣ Remove sensitive info
    delete user.password;

    // 3️⃣ Build profile image URL if available
    let profileImageUrl = null;
    if (user.profile_image_path) {
      profileImageUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/profiles/${user.profile_image_path}`;
    }

    delete user.profile_image_path;

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        ...user,
        profile_image: profileImageUrl,
      },
    });
  } catch (error) {
    console.error("❌ getProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  getProfile,
};
