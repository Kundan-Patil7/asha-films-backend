// const db = require("../config/database");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const fs = require("fs");

// const JWT_SECRET = process.env.JWT_SECRET;

// // ===================== UTILITIES ====================

// // OTP generator
// const generateOTP = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// // Helper function to construct image URLs
// const constructImageUrl = (req, folder, filename) => {
//   if (!filename) return null;
//   return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
// };

// // Helper function to delete old files
// const deleteOldFile = (filename, folder = "user_media") => {
//   if (filename) {
//     const filePath = path.join(__dirname, "..", "uploads", folder, filename);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   }
// };

// // ===================== REGISTER USER =================
// const registerUser = async (req, res) => {
//   try {
//     const { pan_no, aadhaar_no, name, email, mobile, password } = req.body;

//     // Validate required fields
//     if (!pan_no || !aadhaar_no || !name || !email || !mobile || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Create users table if not exists
//     const createUserTable = `
//       CREATE TABLE IF NOT EXISTS users (
//         id  INT AUTO_INCREMENT PRIMARY KEY,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         mobile VARCHAR(20) NOT NULL UNIQUE,
//         plan ENUM('free', 'premium') DEFAULT 'free',
//         suspended BOOLEAN DEFAULT FALSE,
//         suspended_from DATETIME NULL,
//         suspended_to DATETIME NULL,
//         blocked BOOLEAN DEFAULT FALSE,
//         otp_code VARCHAR(6) NULL,
//         is_verified BOOLEAN DEFAULT 0,
//         pan_no VARCHAR(50) NOT NULL UNIQUE,
//         aadhaar_no VARCHAR(50) NOT NULL UNIQUE,
//         name VARCHAR(255) NOT NULL,
//         first_name VARCHAR(255) NULL,
//         middle_name VARCHAR(255) NULL,
//         last_name VARCHAR(255) NULL,
//         date_of_birth DATE NULL,
//         gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
//         current_location VARCHAR(255) NULL,
//         country VARCHAR(100) NULL,
//         state VARCHAR(100) NULL,
//         city VARCHAR(100) NULL,
//         nationality VARCHAR(100) NULL,
//         profileType VARCHAR(100) NULL,
//         passport BOOLEAN DEFAULT FALSE,
//         driver_license BOOLEAN DEFAULT FALSE,
//         cinta_card VARCHAR(50) NULL,
//         height INT NULL,
//         weight INT NULL,
//         shoe_size VARCHAR(10) NULL,
//         language VARCHAR(255) NULL,
//         hobbies TEXT NULL,
//         sports TEXT NULL,
//         body_type VARCHAR(100) NULL,
//         skin_tone VARCHAR(100) NULL,
//         moustache VARCHAR(100) NULL,
//         hair_length VARCHAR(100) NULL,
//         hair_color VARCHAR(100) NULL,
//         beard VARCHAR(100) NULL,
//         tattoo_piercing VARCHAR(100) NULL,
//         measurement VARCHAR(255) NULL,
//         eye_color VARCHAR(100) NULL,
//         distinctive_features TEXT NULL,
//         disabilities TEXT NULL,
//         cup_size VARCHAR(50) NULL,
//         above_bust VARCHAR(50) NULL,
//         bust VARCHAR(50) NULL,
//         under_bust VARCHAR(50) NULL,
//         waist VARCHAR(50) NULL,
//         lower_waist VARCHAR(50) NULL,
//         hips VARCHAR(50) NULL,
//         arm_hole VARCHAR(50) NULL,
//         biceps VARCHAR(50) NULL,
//         shoulder VARCHAR(50) NULL,
//         sleeve_length VARCHAR(50) NULL,
//         trouser_length VARCHAR(50) NULL,
//         inseam_length VARCHAR(50) NULL,
//         upper_thigh VARCHAR(50) NULL,
//         till_elbow VARCHAR(50) NULL,
//         lower_thigh VARCHAR(50) NULL,
//         collar VARCHAR(50) NULL,
//         fork VARCHAR(50) NULL,
//         two_wheeler BOOLEAN DEFAULT FALSE,
//         four_wheeler BOOLEAN DEFAULT FALSE,
//         lead_roles BOOLEAN DEFAULT FALSE,
//         supporting_roles BOOLEAN DEFAULT FALSE,
//         background_extras BOOLEAN DEFAULT FALSE,
//         child_roles BOOLEAN DEFAULT FALSE,
//         elderly_roles BOOLEAN DEFAULT FALSE,
//         romantic_roles BOOLEAN DEFAULT FALSE,
//         villain_roles BOOLEAN DEFAULT FALSE,
//         comedy_roles BOOLEAN DEFAULT FALSE,
//         period_roles BOOLEAN DEFAULT FALSE,
//         fantasy_sci_fi_roles BOOLEAN DEFAULT FALSE,
//         special_category BOOLEAN DEFAULT FALSE,
//         special_niche VARCHAR(255) NULL,
//         plus_size_model BOOLEAN DEFAULT FALSE,
//         petite_model BOOLEAN DEFAULT FALSE,
//         lgbtq_friendly BOOLEAN DEFAULT FALSE,
//         theatre BOOLEAN DEFAULT FALSE,
//         print_modeling BOOLEAN DEFAULT FALSE,
//         reality_shows BOOLEAN DEFAULT FALSE,
//         imdb_profile VARCHAR(255) NULL,
//         acting_experience TEXT NULL,
//         professional_training TEXT NULL,
//         instagram_link VARCHAR(255) NULL,
//         influencer_type VARCHAR(255) NULL,
//         influencer_niche VARCHAR(255) NULL,
//         agency_name VARCHAR(255) NULL,
//         manager_name VARCHAR(255) NULL,
//         hand_modeling BOOLEAN DEFAULT FALSE,
//         foot_modeling BOOLEAN DEFAULT FALSE,
//         body_double BOOLEAN DEFAULT FALSE,
//         body_double_actor_name VARCHAR(255) NULL,
//         lookalike_actor_name VARCHAR(255) NULL,
//         skills TEXT NULL,
//         image VARCHAR(255) NULL,
//         images JSON DEFAULT NULL,
//         headshot_image VARCHAR(255) DEFAULT NULL,
//         full_image VARCHAR(255) DEFAULT NULL,
//         audition_video VARCHAR(255) DEFAULT NULL,
//         portfolio_link VARCHAR(255) DEFAULT NULL,
//         availabilities TEXT NULL,


// -- the below fields will get change when thir plans will ger updated 
//  -- Basic plan information
//   plan_id BIGINT DEFAULT NULL,
//   plan_name VARCHAR(55) DEFAULT 'free',
//   plan_expiry DATE DEFAULT NULL,
//   plan_purchase_date DATE DEFAULT NULL,
//   plan_auto_renew BOOLEAN DEFAULT FALSE,
//   plan_price DECIMAL(10,2) DEFAULT 0.00,
  
//   -- Features (copied from plan at time of purchase)
//   verified_actor_badge BOOLEAN DEFAULT FALSE,
//   consolidated_profile BOOLEAN DEFAULT FALSE,
//   free_learning_videos BOOLEAN DEFAULT FALSE,
//   unlimited_applications BOOLEAN DEFAULT FALSE,
  
//   -- Notifications
//   email_alerts BOOLEAN DEFAULT FALSE,
//   whatsapp_alerts BOOLEAN DEFAULT FALSE,
  
//   -- Limits
//   max_pics_upload INT DEFAULT 0,
//   max_intro_videos INT DEFAULT 0,
//   max_audition_videos INT DEFAULT 0,
//   max_work_links INT DEFAULT 0,
  
//   -- Additional benefits
//   masterclass_access BOOLEAN DEFAULT FALSE,
//   showcase_featured BOOLEAN DEFAULT FALSE,
//   reward_points_on_testimonial INT DEFAULT 0,
  
//   -- Plan usage tracking
//   uploaded_pics_count INT DEFAULT 0,
//   uploaded_intro_videos_count INT DEFAULT 0,
//   uploaded_audition_videos_count INT DEFAULT 0,
//   uploaded_work_links_count INT DEFAULT 0,

//   showcase_facebook_link VARCHAR(255),
//   showcase_youtube_link VARCHAR(255),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       );
//     `;

//     await db.query(createUserTable);

//     // Check if user already exists
//     const [existingUsers] = await db.query(
//       `SELECT * FROM users WHERE email = ? OR mobile = ?`,
//       [email, mobile]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: "User with this email or mobile already exists",
//       });
//     }

//     // Hash password and generate OTP
//     const hashedPassword = await bcrypt.hash(password, 11);
//     const otp = generateOTP();

//     // Insert new user
//     await db.query(
//       `INSERT INTO users (pan_no, aadhaar_no, name, email, mobile, password, otp_code) 
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [pan_no, aadhaar_no, name, email, mobile, hashedPassword, otp]
//     );

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully. Please verify OTP.",
//       otp, // Remove in production
//     });
//   } catch (error) {
//     console.error("❌ registerUser error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== LOGIN USER =====================
// const loginUser = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;
//     // "identifier" can be either email or mobile

//     if (!identifier || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email/Mobile and password are required",
//       });
//     }

//     // Find user by email OR mobile
//     const [rows] = await db.query(
//       `SELECT * FROM users WHERE email = ? OR mobile = ?`,
//       [identifier, identifier]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const user = rows[0];

//     // Check verification / suspension / block status
//     if (!user.is_verified) {
//       return res.status(403).json({
//         success: false,
//         message: "Please verify your account first",
//       });
//     }

//     if (user.suspended || user.blocked) {
//       return res.status(403).json({
//         success: false,
//         message: "Account suspended or blocked",
//       });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // Generate JWT
//     const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
//       expiresIn: "8h",
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//         plan: user.plan,
//         is_verified: user.is_verified,
//         image: constructImageUrl(req, "user_media", user.image),
//         updated_at: user.updated_at,
//       },
//     });
//   } catch (error) {
//     console.error("❌ loginUser error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== VERIFY OTP =====================
// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required",
//       });
//     }

//     const [rows] = await db.query(
//       `SELECT otp_code FROM users WHERE email = ?`,
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (rows[0].otp_code !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     await db.query(
//       `UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?`,
//       [email]
//     );

//     res.status(200).json({
//       success: true,
//       message: "User verified successfully",
//     });
//   } catch (error) {
//     console.error("❌ verifyOTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== RESEND OTP =====================
// const resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // Check if user exists
//     const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
//       email,
//     ]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Generate new OTP
//     const otp = generateOTP();

//     // Update OTP in database
//     await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
//       otp,
//       email,
//     ]);

//     // In production, you would send OTP via email/SMS here
//     res.status(200).json({
//       success: true,
//       message: "OTP resent successfully",
//       otp, // Remove in production
//     });
//   } catch (error) {
//     console.error("❌ resendOTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== FORGOT PASSWORD =====================
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
//       email,
//     ]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const otp = generateOTP();
//     await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
//       otp,
//       email,
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "OTP sent to your email (for demo returning in response)",
//       otp, // Remove in production
//     });
//   } catch (error) {
//     console.error("❌ forgotPassword error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== RESET PASSWORD =====================
// const resetPassword = async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;

//     if (!email || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and new password are required",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 11);

//     const [result] = await db.query(
//       `UPDATE users SET password = ? WHERE email = ?`,
//       [hashedPassword, email]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Password reset successful",
//     });
//   } catch (error) {
//     console.error("❌ resetPassword error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== GET PROFILE =====================
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Profile not found",
//       });
//     }

//     const user = rows[0];
//     delete user.password;
//     delete user.otp_code;

//     const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media`;

//     // Convert image fields to full URLs
//     if (user.image) {
//       user.image = `${baseUrl}/${user.image}`;
//     }

//     if (user.headshot_image) {
//       user.headshot_image = `${baseUrl}/${user.headshot_image}`;
//     }

//     if (user.full_image) {
//       user.full_image = `${baseUrl}/${user.full_image}`;
//     }

//     if (user.audition_video) {
//       user.audition_video = `${baseUrl}/${user.audition_video}`;
//     }

//     // Convert images JSON to array of URLs
//     if (user.images) {
//       try {
//         const parsedImages = JSON.parse(user.images);
//         if (Array.isArray(parsedImages)) {
//           user.images = parsedImages.map((img) => `${baseUrl}/${img}`);
//         }
//       } catch (err) {
//         user.images = [];
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Profile fetched",
//       user,
//     });
//   } catch (error) {
//     console.error("❌ getProfile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== UPDATE PROFILE =====================
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const updates = { ...req.body };

//     // Remove restricted fields
//     const restricted = [
//       "id",
//       "email",
//       "password",
//       "otp_code",
//       "is_verified",
//       "created_at",
//       "updated_at",
//     ];
//     restricted.forEach((field) => delete updates[field]);

//     // Handle single profile image
//     if (req.files && req.files.image) {
//       const [rows] = await db.query("SELECT image FROM users WHERE id = ?", [
//         userId,
//       ]);

//       if (rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       deleteOldFile(rows[0].image);
//       updates.image = req.files.image[0].filename;
//     }

//     // Handle headshot image
//     if (req.files && req.files.headshot_image) {
//       const [rows] = await db.query(
//         "SELECT headshot_image FROM users WHERE id = ?",
//         [userId]
//       );

//       if (rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       deleteOldFile(rows[0].headshot_image);
//       updates.headshot_image = req.files.headshot_image[0].filename;
//     }

//     // Handle full body image
//     if (req.files && req.files.full_image) {
//       const [rows] = await db.query(
//         "SELECT full_image FROM users WHERE id = ?",
//         [userId]
//       );

//       if (rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       deleteOldFile(rows[0].full_image);
//       updates.full_image = req.files.full_image[0].filename;
//     }

//     // Handle multiple images upload (append mode)
//     if (req.files && req.files.images) {
//       const [rows] = await db.query("SELECT images FROM users WHERE id = ?", [
//         userId,
//       ]);
//       let currentImages = rows[0].images ? JSON.parse(rows[0].images) : [];

//       const newImages = req.files.images.map((file) => file.filename);
//       updates.images = JSON.stringify([...currentImages, ...newImages]);
//     }

//     // Handle audition video upload
//     if (req.files && req.files.audition_video) {
//       const [rows] = await db.query(
//         "SELECT audition_video FROM users WHERE id = ?",
//         [userId]
//       );

//       deleteOldFile(rows[0]?.audition_video);
//       updates.audition_video = req.files.audition_video[0].filename;
//     }

//     // Handle portfolio link
//     if (updates.portfolio_link) {
//       updates.portfolio_link = updates.portfolio_link.trim();
//     }

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No fields to update",
//       });
//     }

//     const setClause = Object.keys(updates)
//       .map((f) => `${f} = ?`)
//       .join(", ");
//     const values = Object.values(updates);

//     await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [
//       ...values,
//       userId,
//     ]);

//     const [updatedUser] = await db.query(`SELECT * FROM users WHERE id = ?`, [
//       userId,
//     ]);
//     delete updatedUser[0].password;
//     delete updatedUser[0].otp_code;

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser[0],
//     });
//   } catch (error) {
//     console.error("❌ updateProfile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== GET USER BY ID =====================
// const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [rows] = await db.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [
//       id,
//     ]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     let user = rows[0];

//     // Remove sensitive/unnecessary fields
//     const sensitiveFields = [
//       "password",
//       "otp_code",
//       "blocked",
//       "suspended",
//       "suspended_from",
//       "suspended_to",
//       "is_verified",
//     ];
//     sensitiveFields.forEach((field) => delete user[field]);

//     const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media`;

//     // Convert image fields into full URLs
//     if (user.image) {
//       user.image = `${baseUrl}/${user.image}`;
//     }

//     if (user.headshot_image) {
//       user.headshot_image = `${baseUrl}/${user.headshot_image}`;
//     }

//     if (user.full_image) {
//       user.full_image = `${baseUrl}/${user.full_image}`;
//     }

//     if (user.audition_video) {
//       user.audition_video = `${baseUrl}/${user.audition_video}`;
//     }

//     // Convert images JSON into array of URLs
//     if (user.images) {
//       try {
//         const parsedImages = JSON.parse(user.images);
//         if (Array.isArray(parsedImages)) {
//           user.images = parsedImages.map((img) => `${baseUrl}/${img}`);
//         } else {
//           user.images = [];
//         }
//       } catch (err) {
//         user.images = [];
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("❌ getUserById error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // ===================== JOB APPLICATION =====================
// const jobApply = async (req, res) => {
//   try {
//     // Ensure table exists with correct structure
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS job_applications (
//         application_id INT AUTO_INCREMENT PRIMARY KEY,
//         status BOOLEAN NOT NULL DEFAULT FALSE,
//         role_specific_info TEXT,
//         job_id INT NOT NULL,
//         user_id INT NOT NULL,
//         travel BOOLEAN NOT NULL DEFAULT FALSE,
//         availability BOOLEAN NOT NULL DEFAULT FALSE,
//         previous_work TEXT DEFAULT NULL,
//         courses TEXT DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         UNIQUE KEY unique_user_job (user_id, job_id),
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (job_id) REFERENCES job(id) ON DELETE CASCADE
//       );
//     `;
//     await db.query(createTableQuery);

//     const {
//       status = false,
//       role_specific_info,
//       previous_work,
//       courses,
//       job_id,
//       travel = false,
//       availability = false,
//     } = req.body;

//     // Validate required fields
//     if (!job_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Job ID is required",
//       });
//     }

//     const user_id = req.user.id;

//     // Verify the job exists and is active
//     const [jobCheck] = await db.query(
//       `
//       SELECT id, production_house_id, project_type, application_deadline 
//       FROM job 
//       WHERE id = ?
//     `,
//       [job_id]
//     );

//     if (jobCheck.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Job not found",
//       });
//     }

//     const job = jobCheck[0];

//     // Check if application deadline has passed
//     if (
//       job.application_deadline &&
//       new Date(job.application_deadline) < new Date()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Application deadline has passed",
//       });
//     }

//     // Check if user already applied for this job
//     const [existing] = await db.query(
//       `
//       SELECT application_id 
//       FROM job_applications 
//       WHERE user_id = ? AND job_id = ?
//     `,
//       [user_id, job_id]
//     );

//     if (existing.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already applied for this job",
//         error: "DUPLICATE_APPLICATION",
//       });
//     }

//     // Insert new application
//     const [result] = await db.query(
//       `
//       INSERT INTO job_applications 
//       (status, role_specific_info, job_id, user_id, travel, availability, previous_work, courses) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `,
//       [status, role_specific_info, job_id, user_id, travel, availability, previous_work, courses]
//     );

//     // Get the complete application data for response
//     const [applicationData] = await db.query(
//       `
//       SELECT 
//         ja.*,
//         j.project_type,
//         j.role_type,
//         j.production_house_name
//       FROM job_applications ja
//       JOIN job j ON ja.job_id = j.id
//       WHERE ja.application_id = ?
//     `,
//       [result.insertId]
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Job application submitted successfully",
//       data: {
//         application_id: result.insertId,
//         user_id,
//         job_id,
//         status,
//         travel,
//         availability,
//         role_specific_info,
//         previous_work,
//         courses,
//         job_info: {
//           project_type: applicationData[0].project_type,
//           role_type: applicationData[0].role_type,
//           production_house: applicationData[0].production_house_name,
//         },
//         applied_at: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error in jobApply controller:", error);

//     // Handle specific MySQL errors
//     if (error.code === "ER_DUP_ENTRY") {
//       return res.status(400).json({
//         success: false,
//         message: "You have already applied for this job",
//         error: "DUPLICATE_APPLICATION",
//       });
//     }

//     if (error.code === "ER_NO_REFERENCED_ROW_2") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid job ID or user ID",
//         error: "FOREIGN_KEY_CONSTRAINT",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to submit job application",
//       error: error.message,
//     });
//   }
// };

// // ===================== GET MY APPLICATIONS =====================
// const getMyApplications = async (req, res) => {
//   try {
//     const user_id = req.user.id;

//     const sql = `
//       SELECT 
//         ja.application_id,
//         ja.status,
//         ja.role_specific_info,
//         ja.travel,
//         ja.availability,
//         ja.created_at,
//         j.id as job_id,
//         j.project_type,
//         j.project_description,
//         j.role_type,
//         j.gender,
//         j.age_range,
//         j.city_location,
//         j.compensation,
//         j.production_house_name,
//         j.image as job_image
//       FROM job_applications ja
//       JOIN job j ON ja.production_id = j.id
//       WHERE ja.user_id = ?
//       ORDER BY ja.created_at DESC
//     `;

//     const [results] = await db.query(sql, [user_id]);

//     const applications = results.map((app) => ({
//       application_id: app.application_id,
//       status: app.status ? "Approved" : "Pending",
//       role_specific_info: app.role_specific_info,
//       travel: app.travel,
//       availability: app.availability,
//       applied_on: app.created_at,
//       job: {
//         id: app.job_id,
//         project_type: app.project_type,
//         project_description: app.project_description,
//         role_type: app.role_type,
//         gender: app.gender,
//         age_range: app.age_range,
//         city_location: app.city_location,
//         compensation: app.compensation,
//         production_house_name: app.production_house_name,
//         image_url: constructImageUrl(req, "jobs", app.job_image),
//       },
//     }));

//     res.status(200).json({
//       success: true,
//       message: "Applications fetched successfully",
//       data: applications,
//       count: applications.length,
//     });
//   } catch (error) {
//     console.error("❌ getMyApplications error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // ===================== CANCEL APPLICATION =====================
// const cancelApplication = async (req, res) => {
//   try {
//     const { application_id } = req.params;
//     const user_id = req.user.id;

//     // Verify application belongs to user
//     const [check] = await db.query(
//       `
//       SELECT application_id 
//       FROM job_applications 
//       WHERE application_id = ? AND user_id = ?
//     `,
//       [application_id, user_id]
//     );

//     if (check.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Application not found or unauthorized",
//       });
//     }

//     await db.query(
//       `
//       DELETE FROM job_applications 
//       WHERE application_id = ? AND user_id = ?
//     `,
//       [application_id, user_id]
//     );

//     res.status(200).json({
//       success: true,
//       message: "Application cancelled successfully",
//     });
//   } catch (error) {
//     console.error("❌ cancelApplication error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


// const ensureUserPlanHistoryTable = async () => {
//   try {
//    const query = `
//   CREATE TABLE IF NOT EXISTS user_plan_history (
//     id BIGINT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT NOT NULL,
//     plan_id BIGINT NOT NULL,
//     plan_name VARCHAR(50) NOT NULL,
//     purchase_date DATE NOT NULL,
//     expiry_date DATE NOT NULL,
//     amount_paid DECIMAL(10,2) NOT NULL,
//     payment_method VARCHAR(50),
//     transaction_id VARCHAR(255),
//     auto_renew BOOLEAN DEFAULT FALSE,

//     -- Store all plan features at time of purchase
//     verified_actor_badge BOOLEAN DEFAULT FALSE,
//     consolidated_profile BOOLEAN DEFAULT FALSE,
//     free_learning_videos BOOLEAN DEFAULT FALSE,
//     unlimited_applications BOOLEAN DEFAULT FALSE,
//     email_alerts BOOLEAN DEFAULT FALSE,
//     whatsapp_alerts BOOLEAN DEFAULT FALSE,
//     max_pics_upload INT DEFAULT 0,
//     max_intro_videos INT DEFAULT 0,
//     max_audition_videos INT DEFAULT 0,
//     max_work_links INT DEFAULT 0,
//     masterclass_access BOOLEAN DEFAULT FALSE,
//     showcase_featured BOOLEAN DEFAULT FALSE,
//     reward_points_on_testimonial INT DEFAULT 0,

//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )
// `;


//     await db.query(query);
//     console.log("✅ user_plan_history table ensured!");
//   } catch (err) {
//     console.error("❌ Error ensuring user_plan_history table:", err);
//   }
// };
// const updateUserPlan = async (req, res) => {
//   try {

//     await ensureUserPlanHistoryTable();
//     // Get user ID from middleware (assuming it's attached to req.user)
//     const userId = req.user.id;
    
//     // Get plan details from request body
//     const { plan_id, auto_renew = false, payment_method, transaction_id } = req.body;

//     // Validate required fields
//     if (!plan_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Plan ID is required",
//       });
//     }

//     // Check if the plan exists
//    const [plan] = await db.query("SELECT * FROM plans WHERE id = ?", [plan_id]);

    
//     if (plan.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Plan not found or inactive",
//       });
//     }

//     const selectedPlan = plan[0];
    
//     // Calculate plan expiry date
//     const purchaseDate = new Date();
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + selectedPlan.duration_in_days);

//     // Format dates for MySQL
//     const formattedPurchaseDate = purchaseDate.toISOString().split('T')[0];
//     const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

//     // Start transaction
//     await db.query("START TRANSACTION");

//     try {
//       // Update user's current plan with all features
//       const updateQuery = `
//         UPDATE users 
//         SET 
//           plan_id = ?, 
//           plan_name = ?, 
//            plan = ?,
//           plan_price = ?,
//           plan_purchase_date = ?, 
//           plan_expiry = ?, 
//           plan_auto_renew = ?,
//           verified_actor_badge = ?,
//           consolidated_profile = ?,
//           free_learning_videos = ?,
//           unlimited_applications = ?,
//           email_alerts = ?,
//           whatsapp_alerts = ?,
//           max_pics_upload = ?,
//           max_intro_videos = ?,
//           max_audition_videos = ?,
//           max_work_links = ?,
//           masterclass_access = ?,
//           showcase_featured = ?,
//           reward_points_on_testimonial = ?,
//           uploaded_pics_count = 0,  -- Reset counters on plan change
//           uploaded_intro_videos_count = 0,
//           uploaded_audition_videos_count = 0,
//           uploaded_work_links_count = 0
//         WHERE id = ?
//       `;
      
//       await db.query(updateQuery, [
//         selectedPlan.id, 
//         selectedPlan.name, 
//         selectedPlan.name,
//         selectedPlan.price,
//         formattedPurchaseDate, 
//         formattedExpiryDate, 
//         auto_renew,
//         selectedPlan.verified_actor_badge,
//         selectedPlan.consolidated_profile,
//         selectedPlan.free_learning_videos,
//         selectedPlan.unlimited_applications,
//         selectedPlan.email_alerts,
//         selectedPlan.whatsapp_alerts,
//         selectedPlan.max_pics_upload,
//         selectedPlan.max_intro_videos,
//         selectedPlan.max_audition_videos,
//         selectedPlan.max_work_links,
//         selectedPlan.masterclass_access,
//         selectedPlan.showcase_featured,
//         selectedPlan.reward_points_on_testimonial,
//         userId
//       ]);

//       // Record in plan history with all features
//       const historyQuery = `
//         INSERT INTO user_plan_history 
//         (user_id, plan_id, plan_name, purchase_date, expiry_date, amount_paid, 
//          payment_method, transaction_id, auto_renew,
//          verified_actor_badge, consolidated_profile, free_learning_videos,
//          unlimited_applications, email_alerts, whatsapp_alerts,
//          max_pics_upload, max_intro_videos, max_audition_videos, max_work_links, 
//          masterclass_access, showcase_featured, reward_points_on_testimonial)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
      
//       await db.query(historyQuery, [
//         userId, 
//         selectedPlan.id, 
//         selectedPlan.name,
//         formattedPurchaseDate, 
//         formattedExpiryDate, 
//         selectedPlan.price,
//         payment_method, 
//         transaction_id, 
//         auto_renew,
//         selectedPlan.verified_actor_badge,
//         selectedPlan.consolidated_profile,
//         selectedPlan.free_learning_videos,
//         selectedPlan.unlimited_applications,
//         selectedPlan.email_alerts,
//         selectedPlan.whatsapp_alerts,
//         selectedPlan.max_pics_upload,
//         selectedPlan.max_intro_videos,
//         selectedPlan.max_audition_videos,
//         selectedPlan.max_work_links,
//         selectedPlan.masterclass_access,
//         selectedPlan.showcase_featured,
//         selectedPlan.reward_points_on_testimonial
//       ]);

//       // Commit transaction
//       await db.query("COMMIT");

//       res.status(200).json({
//         success: true,
//         message: "Plan updated successfully",
//         data: {
//           plan: selectedPlan.name,
//           purchase_date: formattedPurchaseDate,
//           expiry_date: formattedExpiryDate,
//           auto_renew: auto_renew
//         }
//       });
//     } catch (error) {
//       // Rollback transaction on error
//       await db.query("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("❌ updateUserPlan error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating plan",
//     });
//   }
// };

// // Get user's current plan details
// const getUserPlan = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const [user] = await db.query(
//       `SELECT 
//         plan_id, plan_name, plan_price, plan_purchase_date, plan_expiry, plan_auto_renew,
//         verified_actor_badge, consolidated_profile, free_learning_videos,
//         unlimited_applications, email_alerts, whatsapp_alerts,
//         max_pics_upload, max_intro_videos, max_audition_videos, max_work_links, 
//         masterclass_access, showcase_featured, reward_points_on_testimonial, 
//         uploaded_pics_count, uploaded_intro_videos_count,
//         uploaded_audition_videos_count, uploaded_work_links_count
//        FROM users 
//        WHERE id = ?`,
//       [userId]
//     );
    
//     if (user.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user[0]
//     });
//   } catch (error) {
//     console.error("❌ getUserPlan error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching plan details",
//     });
//   }
// };

// // Get user's plan history
// const getUserPlanHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const [history] = await db.query(
//       `SELECT *
//        FROM user_plan_history
//        WHERE user_id = ?
//        ORDER BY purchase_date DESC`,
//       [userId]
//     );
    
//     res.status(200).json({
//       success: true,
//       data: history
//     });
//   } catch (error) {
//     console.error("❌ getUserPlanHistory error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching plan history",
//     });
//   }
// };





// // ===================== EXPORTS =====================
// module.exports = {
//   registerUser,
//   loginUser,
//   verifyOTP,
//   resendOTP,
//   forgotPassword,
//   resetPassword,
//   getProfile,
//   updateProfile,
//   getUserById,
//   jobApply,
//   getMyApplications,
//   cancelApplication,
//   updateUserPlan,
//   getUserPlan,
//   getUserPlanHistory
// };


const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;

// ===================== UTILITIES ====================

// OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Helper function to construct image URLs
const constructImageUrl = (req, folder, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};

// Helper function to delete old files
const deleteOldFile = (filename, folder = "user_media") => {
  if (filename) {
    const filePath = path.join(__dirname, "..", "uploads", folder, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// ===================== REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    const { pan_no, aadhaar_no, name, email, mobile, password } = req.body;

    // Validate required fields
    if (!pan_no || !aadhaar_no || !name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create users table if not exists
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id  INT AUTO_INCREMENT PRIMARY KEY,
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
        pan_no VARCHAR(50) NOT NULL UNIQUE,
        aadhaar_no VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NULL,
        middle_name VARCHAR(255) NULL,
        last_name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
        current_location VARCHAR(255) NULL,
        country VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        city VARCHAR(100) NULL,
        nationality VARCHAR(100) NULL,
        profileType VARCHAR(100) NULL,
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
        images JSON DEFAULT NULL,
        headshot_image VARCHAR(255) DEFAULT NULL,
        full_image VARCHAR(255) DEFAULT NULL,
        audition_video VARCHAR(255) DEFAULT NULL,
        portfolio_link VARCHAR(255) DEFAULT NULL,
        availabilities TEXT NULL,

        -- Plan information
        plan_id BIGINT DEFAULT NULL,
        plan_name VARCHAR(55) DEFAULT 'free',
        plan_expiry DATE DEFAULT NULL,
        plan_purchase_date DATE DEFAULT NULL,
        plan_auto_renew BOOLEAN DEFAULT FALSE,
        plan_price DECIMAL(10,2) DEFAULT 0.00,
        
        -- Features (copied from plan at time of purchase)
        verified_actor_badge BOOLEAN DEFAULT FALSE,
        consolidated_profile BOOLEAN DEFAULT FALSE,
        free_learning_videos BOOLEAN DEFAULT FALSE,
        unlimited_applications BOOLEAN DEFAULT FALSE,
        
        -- Notifications
        email_alerts BOOLEAN DEFAULT FALSE,
        whatsapp_alerts BOOLEAN DEFAULT FALSE,
        
        -- Limits
        max_pics_upload INT DEFAULT 0,
        max_intro_videos INT DEFAULT 0,
        max_audition_videos INT DEFAULT 0,
        max_work_links INT DEFAULT 0,
        
        -- Additional benefits
        masterclass_access BOOLEAN DEFAULT FALSE,
        showcase_featured BOOLEAN DEFAULT FALSE,
        reward_points_on_testimonial INT DEFAULT 0,
        
        -- Plan usage tracking
        uploaded_pics_count INT DEFAULT 0,
        uploaded_intro_videos_count INT DEFAULT 0,
        uploaded_audition_videos_count INT DEFAULT 0,
        uploaded_work_links_count INT DEFAULT 0,

        showcase_facebook_link VARCHAR(255),
        showcase_youtube_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await db.query(createUserTable);

    // Check if user already exists
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

    // Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(password, 11);
    const otp = generateOTP();

    // Insert new user
    await db.query(
      `INSERT INTO users (pan_no, aadhaar_no, name, email, mobile, password, otp_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pan_no, aadhaar_no, name, email, mobile, hashedPassword, otp]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify OTP.",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ registerUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== LOGIN USER =====================
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        plan: user.plan,
        is_verified: user.is_verified,
        image: constructImageUrl(req, "user_media", user.image),
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== VERIFY OTP =====================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const [rows] = await db.query(
      `SELECT otp_code FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (rows[0].otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await db.query(
      `UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?`,
      [email]
    );

    res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("❌ verifyOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== RESEND OTP =====================
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP in database
    await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
      otp,
      email,
    ]);

    // In production, you would send OTP via email/SMS here
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ resendOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== FORGOT PASSWORD ================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();
    await db.query(`UPDATE users SET otp_code = ? WHERE email = ?`, [
      otp,
      email,
    ]);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email (for demo returning in response)",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ forgotPassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 11);

    const [result] = await db.query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("❌ resetPassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== GET PROFILE ====================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const user = rows[0];
    delete user.password;
    delete user.otp_code;

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media`;

    // Convert image fields to full URLs
    if (user.image) {
      user.image = `${baseUrl}/${user.image}`;
    }

    if (user.headshot_image) {
      user.headshot_image = `${baseUrl}/${user.headshot_image}`;
    }

    if (user.full_image) {
      user.full_image = `${baseUrl}/${user.full_image}`;
    }

    if (user.audition_video) {
      user.audition_video = `${baseUrl}/${user.audition_video}`;
    }

    // Convert images JSON to array of URLs
    if (user.images) {
      try {
        const parsedImages = JSON.parse(user.images);
        if (Array.isArray(parsedImages)) {
          user.images = parsedImages.map((img) => `${baseUrl}/${img}`);
        }
      } catch (err) {
        user.images = [];
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched",
      user,
    });
  } catch (error) {
    console.error("❌ getProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };

    // Remove restricted fields
    const restricted = [
      "id",
      "email",
      "password",
      "otp_code",
      "is_verified",
      "created_at",
      "updated_at",
    ];
    restricted.forEach((field) => delete updates[field]);

    // Handle single profile image
    if (req.files && req.files.image) {
      const [rows] = await db.query("SELECT image FROM users WHERE id = ?", [
        userId,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      deleteOldFile(rows[0].image);
      updates.image = req.files.image[0].filename;
    }

    // Handle headshot image
    if (req.files && req.files.headshot_image) {
      const [rows] = await db.query(
        "SELECT headshot_image FROM users WHERE id = ?",
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      deleteOldFile(rows[0].headshot_image);
      updates.headshot_image = req.files.headshot_image[0].filename;
    }

    // Handle full body image
    if (req.files && req.files.full_image) {
      const [rows] = await db.query(
        "SELECT full_image FROM users WHERE id = ?",
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      deleteOldFile(rows[0].full_image);
      updates.full_image = req.files.full_image[0].filename;
    }

    // Handle multiple images upload (append mode)
    if (req.files && req.files.images) {
      const [rows] = await db.query("SELECT images FROM users WHERE id = ?", [
        userId,
      ]);
      let currentImages = rows[0].images ? JSON.parse(rows[0].images) : [];

      const newImages = req.files.images.map((file) => file.filename);
      updates.images = JSON.stringify([...currentImages, ...newImages]);
    }

    // Handle audition video upload
    if (req.files && req.files.audition_video) {
      const [rows] = await db.query(
        "SELECT audition_video FROM users WHERE id = ?",
        [userId]
      );

      deleteOldFile(rows[0]?.audition_video);
      updates.audition_video = req.files.audition_video[0].filename;
    }

    // Handle portfolio link
    if (updates.portfolio_link) {
      updates.portfolio_link = updates.portfolio_link.trim();
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== GET USER BY ID =================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        id, name, gender, city, height, hair_color, shoe_size, eye_color,
        availabilities, skills, date_of_birth,
        portfolio_link, imdb_profile, instagram_link, 
        showcase_facebook_link, showcase_youtube_link,
        image, headshot_image, full_image, audition_video, images
       FROM users
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let user = rows[0];
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media`;

    const responseData = {
      id: user.id,
      name: user.name,
      gender: user.gender,
      city: user.city,
      height: user.height,
      hair_color: user.hair_color,
      shoe_size: user.shoe_size,
      eye_color: user.eye_color,
      availabilities: user.availabilities,
      skills: user.skills,
      date_of_birth: user.date_of_birth,
      profile_links: {
        portfolio_link: user.portfolio_link || null,
        imdb_profile: user.imdb_profile || null,
        instagram_link: user.instagram_link || null,
        facebook_link: user.showcase_facebook_link || null,
        youtube_link: user.showcase_youtube_link || null,
      },
      media: {
        profile_image: user.image ? `${baseUrl}/${user.image}` : null,
        headshot_image: user.headshot_image ? `${baseUrl}/${user.headshot_image}` : null,
        full_image: user.full_image ? `${baseUrl}/${user.full_image}` : null,
        audition_video: user.audition_video ? `${baseUrl}/${user.audition_video}` : null,
        images: [],
      },
    };

    if (user.images) {
      try {
        const parsedImages = JSON.parse(user.images);
        if (Array.isArray(parsedImages)) {
          responseData.media.images = parsedImages.map((img) => `${baseUrl}/${img}`);
        }
      } catch {
        responseData.media.images = [];
      }
    }

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("❌ getUserById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== JOB APPLICATION ================
const jobApply = async (req, res) => {
  try {
    // Ensure table exists with correct structure
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS job_applications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        status BOOLEAN NOT NULL DEFAULT FALSE,
        role_specific_info TEXT,
        job_id INT NOT NULL,
        user_id INT NOT NULL,
        travel BOOLEAN NOT NULL DEFAULT FALSE,
        availability BOOLEAN NOT NULL DEFAULT FALSE,
        previous_work TEXT DEFAULT NULL,
        courses TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_job (user_id, job_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES job(id) ON DELETE CASCADE
      );
    `;
    await db.query(createTableQuery);

    const {
      status = false,
      role_specific_info,
      previous_work,
      courses,
      job_id,
      travel = false,
      availability = false,
    } = req.body;

    // Validate required fields
    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const user_id = req.user.id;

    // Verify the job exists and is approved (status = 1)
    const [jobCheck] = await db.query(
      `
      SELECT id, production_house_id, project_type, application_deadline, status
      FROM job 
      WHERE id = ? AND status = 1
    `,
      [job_id]
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not approved yet",
      });
    }

    const job = jobCheck[0];

    // Check if application deadline has passed
    if (
      job.application_deadline &&
      new Date(job.application_deadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    // Check if user already applied for this job
    const [existing] = await db.query(
      `
      SELECT application_id 
      FROM job_applications 
      WHERE user_id = ? AND job_id = ?
    `,
      [user_id, job_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
        error: "DUPLICATE_APPLICATION",
      });
    }

    // Insert new application
    const [result] = await db.query(
      `
      INSERT INTO job_applications 
      (status, role_specific_info, job_id, user_id, travel, availability, previous_work, courses) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [status, role_specific_info, job_id, user_id, travel, availability, previous_work, courses]
    );

    // Get the complete application data for response
    const [applicationData] = await db.query(
      `
      SELECT 
        ja.*,
        j.project_type,
        j.role_type,
        j.production_house_name
      FROM job_applications ja
      JOIN job j ON ja.job_id = j.id
      WHERE ja.application_id = ?
    `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      data: {
        application_id: result.insertId,
        user_id,
        job_id,
        status,
        travel,
        availability,
        role_specific_info,
        previous_work,
        courses,
        job_info: {
          project_type: applicationData[0].project_type,
          role_type: applicationData[0].role_type,
          production_house: applicationData[0].production_house_name,
        },
        applied_at: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error in jobApply controller:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
        error: "DUPLICATE_APPLICATION",
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID or user ID",
        error: "FOREIGN_KEY_CONSTRAINT",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit job application",
      error: error.message,
    });
  }
};

// ===================== GET MY APPLICATIONS ============
const getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const sql = `
      SELECT 
        ja.application_id,
        ja.status,
        ja.role_specific_info,
        ja.travel,
        ja.availability,
        ja.created_at,
        j.id as job_id,
        j.project_type,
        j.project_description,
        j.role_type,
        j.gender,
        j.age_range,
        j.city_location,
        j.compensation,
        j.production_house_name,
        j.image as job_image,
        j.status as job_status
      FROM job_applications ja
      JOIN job j ON ja.job_id = j.id
      WHERE ja.user_id = ?
      ORDER BY ja.created_at DESC
    `;

    const [results] = await db.query(sql, [user_id]);

    const applications = results.map((app) => ({
      application_id: app.application_id,
      status: app.status ? "Approved" : "Pending",
      role_specific_info: app.role_specific_info,
      travel: app.travel,
      availability: app.availability,
      applied_on: app.created_at,
      job: {
        id: app.job_id,
        project_type: app.project_type,
        project_description: app.project_description,
        role_type: app.role_type,
        gender: app.gender,
        age_range: app.age_range,
        city_location: app.city_location,
        compensation: app.compensation,
        production_house_name: app.production_house_name,
        status: app.job_status === 1 ? "Approved" : app.job_status === 2 ? "Rejected" : "Pending",
        image_url: constructImageUrl(req, "jobCovers", app.job_image),
      },
    }));

    res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("❌ getMyApplications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===================== CANCEL APPLICATION =============
const cancelApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const user_id = req.user.id;

    // Verify application belongs to user
    const [check] = await db.query(
      `
      SELECT application_id 
      FROM job_applications 
      WHERE application_id = ? AND user_id = ?
    `,
      [application_id, user_id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized",
      });
    }

    await db.query(
      `
      DELETE FROM job_applications 
      WHERE application_id = ? AND user_id = ?
    `,
      [application_id, user_id]
    );

    res.status(200).json({
      success: true,
      message: "Application cancelled successfully",
    });
  } catch (error) {
    console.error("❌ cancelApplication error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const ensureUserPlanHistoryTable = async () => {
  try {
   const query = `
  CREATE TABLE IF NOT EXISTS user_plan_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id BIGINT NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    auto_renew BOOLEAN DEFAULT FALSE,

    -- Store all plan features at time of purchase
    verified_actor_badge BOOLEAN DEFAULT FALSE,
    consolidated_profile BOOLEAN DEFAULT FALSE,
    free_learning_videos BOOLEAN DEFAULT FALSE,
    unlimited_applications BOOLEAN DEFAULT FALSE,
    email_alerts BOOLEAN DEFAULT FALSE,
    whatsapp_alerts BOOLEAN DEFAULT FALSE,
    max_pics_upload INT DEFAULT 0,
    max_intro_videos INT DEFAULT 0,
    max_audition_videos INT DEFAULT 0,
    max_work_links INT DEFAULT 0,
    masterclass_access BOOLEAN DEFAULT FALSE,
    showcase_featured BOOLEAN DEFAULT FALSE,
    reward_points_on_testimonial INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

    await db.query(query);
    console.log("✅ user_plan_history table ensured!");
  } catch (err) {
    console.error("❌ Error ensuring user_plan_history table:", err);
  }
};

const updateUserPlan = async (req, res) => {
  try {
    await ensureUserPlanHistoryTable();
    // Get user ID from middleware (assuming it's attached to req.user)
    const userId = req.user.id;
    
    // Get plan details from request body
    const { plan_id, auto_renew = false, payment_method, transaction_id } = req.body;

    // Validate required fields
    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Check if the plan exists
   const [plan] = await db.query("SELECT * FROM plans WHERE id = ?", [plan_id]);

    
    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    const selectedPlan = plan[0];
    
    // Calculate plan expiry date
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + selectedPlan.duration_in_days);

    // Format dates for MySQL
    const formattedPurchaseDate = purchaseDate.toISOString().split('T')[0];
    const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

    // Start transaction
    await db.query("START TRANSACTION");

    try {
      // Update user's current plan with all features
      const updateQuery = `
        UPDATE users 
        SET 
          plan_id = ?, 
          plan_name = ?, 
           plan = ?,
          plan_price = ?,
          plan_purchase_date = ?, 
          plan_expiry = ?, 
          plan_auto_renew = ?,
          verified_actor_badge = ?,
          consolidated_profile = ?,
          free_learning_videos = ?,
          unlimited_applications = ?,
          email_alerts = ?,
          whatsapp_alerts = ?,
          max_pics_upload = ?,
          max_intro_videos = ?,
          max_audition_videos = ?,
          max_work_links = ?,
          masterclass_access = ?,
          showcase_featured = ?,
          reward_points_on_testimonial = ?,
          uploaded_pics_count = 0,  -- Reset counters on plan change
          uploaded_intro_videos_count = 0,
          uploaded_audition_videos_count = 0,
          uploaded_work_links_count = 0
        WHERE id = ?
      `;
      
      await db.query(updateQuery, [
        selectedPlan.id, 
        selectedPlan.name, 
        selectedPlan.name,
        selectedPlan.price,
        formattedPurchaseDate, 
        formattedExpiryDate, 
        auto_renew,
        selectedPlan.verified_actor_badge,
        selectedPlan.consolidated_profile,
        selectedPlan.free_learning_videos,
        selectedPlan.unlimited_applications,
        selectedPlan.email_alerts,
        selectedPlan.whatsapp_alerts,
        selectedPlan.max_pics_upload,
        selectedPlan.max_intro_videos,
        selectedPlan.max_audition_videos,
        selectedPlan.max_work_links,
        selectedPlan.masterclass_access,
        selectedPlan.showcase_featured,
        selectedPlan.reward_points_on_testimonial,
        userId
      ]);

      // Record in plan history with all features
      const historyQuery = `
        INSERT INTO user_plan_history 
        (user_id, plan_id, plan_name, purchase_date, expiry_date, amount_paid, 
         payment_method, transaction_id, auto_renew,
         verified_actor_badge, consolidated_profile, free_learning_videos,
         unlimited_applications, email_alerts, whatsapp_alerts,
         max_pics_upload, max_intro_videos, max_audition_videos, max_work_links, 
         masterclass_access, showcase_featured, reward_points_on_testimonial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.query(historyQuery, [
        userId, 
        selectedPlan.id, 
        selectedPlan.name,
        formattedPurchaseDate, 
        formattedExpiryDate, 
        selectedPlan.price,
        payment_method, 
        transaction_id, 
        auto_renew,
        selectedPlan.verified_actor_badge,
        selectedPlan.consolidated_profile,
        selectedPlan.free_learning_videos,
        selectedPlan.unlimited_applications,
        selectedPlan.email_alerts,
        selectedPlan.whatsapp_alerts,
        selectedPlan.max_pics_upload,
        selectedPlan.max_intro_videos,
        selectedPlan.max_audition_videos,
        selectedPlan.max_work_links,
        selectedPlan.masterclass_access,
        selectedPlan.showcase_featured,
        selectedPlan.reward_points_on_testimonial
      ]);

      // Commit transaction
      await db.query("COMMIT");

      res.status(200).json({
        success: true,
        message: "Plan updated successfully",
        data: {
          plan: selectedPlan.name,
          purchase_date: formattedPurchaseDate,
          expiry_date: formattedExpiryDate,
          auto_renew: auto_renew
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("❌ updateUserPlan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating plan",
    });
  }
};

// Get user's current plan details
const getUserPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [user] = await db.query(
      `SELECT 
        plan_id, plan_name, plan_price, plan_purchase_date, plan_expiry, plan_auto_renew,
        verified_actor_badge, consolidated_profile, free_learning_videos,
        unlimited_applications, email_alerts, whatsapp_alerts,
        max_pics_upload, max_intro_videos, max_audition_videos, max_work_links, 
        masterclass_access, showcase_featured, reward_points_on_testimonial, 
        uploaded_pics_count, uploaded_intro_videos_count,
        uploaded_audition_videos_count, uploaded_work_links_count
       FROM users 
       WHERE id = ?`,
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (error) {
    console.error("❌ getUserPlan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plan details",
    });
  }
};

// Get user's plan history
const getUserPlanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [history] = await db.query(
      `SELECT *
       FROM user_plan_history
       WHERE user_id = ?
       ORDER BY purchase_date DESC`,
      [userId]
    );
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("❌ getUserPlanHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plan history",
    });
  }
};



//  const CallsForYou = async (req, res) => {
 
//   const userId = req.user.id;

//   try {
//     // 1️⃣ Fetch user info
//     const [userRows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
//     if (userRows.length === 0) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     const user = userRows[0];

//     // 2️⃣ Fetch all jobs
//     const [jobs] = await db.query(`SELECT * FROM job WHERE status = 1`); // only active jobs

//     // 3️⃣ Filtering logic
//     const applicableJobs = jobs.filter((job) => {
//       // gender match
//       if (job.gender && job.gender !== "Other" && job.gender !== user.gender) {
//         return false;
//       }

//       // language check
//       if (job.language_required && user.language) {
//         const userLanguages = user.language.split(",").map((l) => l.trim().toLowerCase());
//         if (!userLanguages.includes(job.language_required.toLowerCase())) {
//           return false;
//         }
//       }

//       // age check
//       if (job.age_range && user.date_of_birth) {
//         const age = Math.floor(
//           (new Date() - new Date(user.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)
//         );
//         const [minAge, maxAge] = job.age_range.split("-").map((n) => parseInt(n));
//         if (age < minAge || age > maxAge) {
//           return false;
//         }
//       }

//       // body type check
//       if (job.body_type && user.body_type && job.body_type.toLowerCase() !== user.body_type.toLowerCase()) {
//         return false;
//       }

//       // skills check
//       if (job.skills_needed && user.skills) {
//         const jobSkills = job.skills_needed.toLowerCase().split(",");
//         const userSkills = user.skills.toLowerCase().split(",");
//         const matched = jobSkills.some((skill) => userSkills.includes(skill.trim()));
//         if (!matched) return false;
//       }

//       return true;
//     });

//     // 4️⃣ Response
//     res.status(200).json({
//       success: true,
//       total_jobs: applicableJobs.length,
//       jobs: applicableJobs,
//     });
//   } catch (error) {
//     console.error("❌ CallsForYou error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


const CallsForYou = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1️⃣ Fetch user info
    const [userRows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = userRows[0];

    // 2️⃣ Fetch all active jobs
    const [jobs] = await db.query(`SELECT * FROM job WHERE status = 1`);

    // 3️⃣ Fetch jobs user has already applied for
    const [appliedJobs] = await db.query(
      `SELECT job_id FROM job_applications WHERE user_id = ?`,
      [userId]
    );
    
    const appliedJobIds = appliedJobs.map(job => job.job_id);
    console.log('User has applied for job IDs:', appliedJobIds);

    // 4️⃣ Filtering logic
    const applicableJobs = jobs.filter((job) => {
      // gender match
      if (job.gender && job.gender !== "Other" && job.gender !== user.gender) {
        return false;
      }

      // language check
      if (job.language_required && user.language) {
        const userLanguages = user.language.split(",").map((l) => l.trim().toLowerCase());
        if (!userLanguages.includes(job.language_required.toLowerCase())) {
          return false;
        }
      }

      // age check
      if (job.age_range && user.date_of_birth) {
        const age = Math.floor(
          (new Date() - new Date(user.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)
        );
        const [minAge, maxAge] = job.age_range.split("-").map((n) => parseInt(n));
        if (age < minAge || age > maxAge) {
          return false;
        }
      }

      // body type check
      if (job.body_type && user.body_type && job.body_type.toLowerCase() !== user.body_type.toLowerCase()) {
        return false;
      }

      // skills check
      if (job.skills_needed && user.skills) {
        const jobSkills = job.skills_needed.toLowerCase().split(",");
        const userSkills = user.skills.toLowerCase().split(",");
        const matched = jobSkills.some((skill) => userSkills.includes(skill.trim()));
        if (!matched) return false;
      }

      return true;
    });

    // 5️⃣ Response - include applied_job_ids so frontend can filter/hide them
    res.status(200).json({
      success: true,
      total_jobs: applicableJobs.length,
      jobs: applicableJobs,
      applied_job_ids: appliedJobIds // Send this to frontend
    });
  } catch (error) {
    console.error("❌ CallsForYou error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




// ===================== EXPORTS =====================
module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getUserById,
  jobApply,
  getMyApplications,
  cancelApplication,
  updateUserPlan,
  getUserPlan,
  getUserPlanHistory,
  CallsForYou,
};