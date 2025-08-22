const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;

// ===================== UTILITIES =====================

// OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper function to construct file URLs
const getFileUrl = (req, folder, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};

// Helper function to construct image URLs
const constructImageUrl = (req, folder, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};

// Helper function to delete old files
const deleteOldFile = (filename, folder) => {
  if (filename) {
    const filePath = path.join(__dirname, "..", "uploads", folder, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

// ===================== PRODUCTION HOUSE AUTHENTICATION =====================

const registerProductionHouse = async (req, res) => {
  try {
    const requiredFields = [
      "gst_no",
      "pan_no", 
      "aadhaar_no",
      "company_name",
      "type_of_work",
      "email",
      "phone_number",
      "password",
    ];

    // Validate required fields
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const { email, phone_number } = req.body;

    // Create production_house table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS production_house (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gst_no VARCHAR(50) NOT NULL,
        pan_no VARCHAR(50) NOT NULL,
        aadhaar_no VARCHAR(50) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        alternate_contact VARCHAR(20) NULL,
        location VARCHAR(255) NULL,
        website_url VARCHAR(255) NULL,
        type_of_work VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        otp_code VARCHAR(6) NULL,
        verified BOOLEAN DEFAULT FALSE,
        
        -- Industry type flags
        is_casting_director BOOLEAN DEFAULT FALSE,
        is_production_house BOOLEAN DEFAULT FALSE,
        is_ad_agency BOOLEAN DEFAULT FALSE,
        is_event_agency BOOLEAN DEFAULT FALSE,
        is_theater_group BOOLEAN DEFAULT FALSE,
        is_studio BOOLEAN DEFAULT FALSE,
        is_talent_agency BOOLEAN DEFAULT FALSE,

        -- Work domain flags
        works_tv BOOLEAN DEFAULT FALSE,
        works_film BOOLEAN DEFAULT FALSE,
        works_ott BOOLEAN DEFAULT FALSE,
        works_ads BOOLEAN DEFAULT FALSE,
        works_print BOOLEAN DEFAULT FALSE,
        works_theatre BOOLEAN DEFAULT FALSE,
        works_events BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Check for existing production house
    const [existing] = await db.query(
      `SELECT * FROM production_house WHERE email = ? OR phone_number = ?`,
      [email, phone_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or Phone already exists",
      });
    }

    // Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(req.body.password, 11);
    const otp = generateOTP();

    await db.query(`INSERT INTO production_house SET ?`, {
      ...req.body,
      password: hashedPassword,
      otp_code: otp,
    });

    res.status(201).json({
      success: true,
      message: "Production House registered successfully. Please verify OTP.",
      otp, // Remove in production - only for testing
    });
  } catch (error) {
    console.error("❌ registerProductionHouse error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const loginProductionHouse = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password required",
      });
    }

    // Find production house by email or phone
    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE email = ? OR phone_number = ?`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const prod = rows[0];

    // Check if account is verified
    if (!prod.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, prod.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
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
        image: getFileUrl(req, "production", prod.image),
        type: prod.type_of_work,
        updated_at: prod.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ loginProductionHouse error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const verifyProductionHouseOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const [rows] = await db.query(
      `SELECT otp_code FROM production_house WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (rows[0].otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark account as verified and clear OTP
    await db.query(
      `UPDATE production_house SET verified = 1, otp_code = NULL WHERE email = ?`,
      [email]
    );

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error("❌ verifyProductionHouseOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const resendProductionHouseOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if account exists
    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const prod = rows[0];

    if (prod.verified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified. No need to resend OTP",
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Save new OTP
    await db.query(
      `UPDATE production_house SET otp_code = ? WHERE email = ?`,
      [otp, email]
    );

    res.status(200).json({
      success: true,
      message: "OTP resent successfully (for demo returned in response)",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ resendProductionHouseOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===================== PASSWORD RESET =====================

const forgotProductionHousePassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const prod = rows[0];

    // Check if verified
    if (!prod.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first before resetting password",
      });
    }

    const otp = generateOTP();

    await db.query(
      `UPDATE production_house SET otp_code = ? WHERE email = ?`,
      [otp, email]
    );

    res.status(200).json({
      success: true,
      message: "OTP sent (for demo returned in response)",
      otp, // Remove in production
    });
  } catch (error) {
    console.error("❌ forgotProductionHousePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const resetProductionHousePassword = async (req, res) => {
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
      `UPDATE production_house SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("❌ resetProductionHousePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===================== PROFILE MANAGEMENT =====================

const getProductionHouseProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM production_house WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const prod = rows[0];
    delete prod.password;
    delete prod.otp_code;

    // Add full URL for image
    if (prod.image) {
      prod.image = getFileUrl(req, "production", prod.image);
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched",
      production_house: prod,
    });
  } catch (error) {
    console.error("❌ getProductionHouseProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProductionHouseProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const updates = { ...req.body };

    // Remove restricted fields
    const restricted = [
      "id",
      "email",
      "password",
      "otp_code",
      "verified",
      "created_at",
      "updated_at",
    ];
    restricted.forEach(field => delete updates[field]);

    // Handle image upload
    if (req.file) {
      // Get old image to delete
      const [rows] = await db.query(
        "SELECT image FROM production_house WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      // Delete old image if exists
      deleteOldFile(rows[0].image, "production");
      updates.image = req.file.filename;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await db.query(`UPDATE production_house SET ? WHERE id = ?`, [updates, id]);

    // Return updated profile
    const [updated] = await db.query(
      `SELECT * FROM production_house WHERE id = ?`,
      [id]
    );

    delete updated[0].password;
    delete updated[0].otp_code;

    if (updated[0].image) {
      updated[0].image = getFileUrl(req, "production", updated[0].image);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      production_house: updated[0],
    });
  } catch (error) {
    console.error("❌ updateProductionHouseProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===================== JOB MANAGEMENT =====================

// Initialize job table
const initJobTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS job (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_type VARCHAR(100) NOT NULL,
      project_description TEXT NOT NULL,
      language_required VARCHAR(100) NOT NULL,
      role_details TEXT,
      role_type ENUM('Primary', 'Secondary', 'Tertiary') NOT NULL,
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      age_range VARCHAR(50) NOT NULL,
      height VARCHAR(50),
      body_type VARCHAR(100),
      skills_needed TEXT,
      role_description TEXT,
      phone_number VARCHAR(20) NOT NULL,
      email VARCHAR(150) NOT NULL,
      city_location VARCHAR(150) NOT NULL,
      audition_type ENUM('Self Tape', 'Online', 'Offline') NOT NULL,
      audition_dates VARCHAR(100),
      shoot_dates VARCHAR(100),
      shoot_duration VARCHAR(50),
      application_deadline DATE,
      availability_required ENUM('Full-time', 'Part-time', 'Flexible'),
      compensation VARCHAR(50),
      image VARCHAR(255),
      production_house_id INT,
      production_house_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

const addJob = async (req, res) => {
  try {
    await initJobTable();

    const requiredFields = [
      "project_type",
      "project_description", 
      "language_required",
      "phone_number",
      "email",
      "city_location",
    ];

    // Validate required fields
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const jobData = {
      ...req.body,
      production_house_id: req.user.id,
      production_house_name: req.user.company_name,
      image: req.file?.filename || null,
    };

    await db.query(`INSERT INTO job SET ?`, [jobData]);

    res.status(201).json({
      success: true,
      message: "Job added successfully",
    });
  } catch (error) {
    console.error("❌ addJob error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const editJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Verify job exists and belongs to this production house
    const [existingJob] = await db.query(
      `SELECT image, production_house_id FROM job WHERE id = ?`,
      [id]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (existingJob[0].production_house_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this job",
      });
    }

    // Handle image updates
    let image = existingJob[0].image;

    if (req.file) {
      // Delete old image if exists
      deleteOldFile(image, "jobs");
      image = req.file.filename;
    } else if (req.body.remove_image === "true") {
      // Remove image if requested
      deleteOldFile(image, "jobs");
      image = null;
    }

    updates.image = image;

    // Remove restricted fields
    const restricted = [
      "id",
      "production_house_id", 
      "production_house_name",
      "created_at",
      "updated_at",
    ];
    restricted.forEach(field => delete updates[field]);

    await db.query(`UPDATE job SET ? WHERE id = ?`, [updates, id]);

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("❌ editJob error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify job exists and belongs to this production house
    const [existingJob] = await db.query(
      `SELECT image, production_house_id FROM job WHERE id = ?`,
      [id]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (existingJob[0].production_house_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this job",
      });
    }

    // Delete image if exists
    deleteOldFile(existingJob[0].image, "jobs");

    await db.query(`DELETE FROM job WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteJob error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(`
      SELECT j.*
      FROM job j
      ORDER BY j.created_at DESC
    `);

    // Format the results with image URLs
    const formattedJobs = jobs.map(job => ({
      ...job,
      image: constructImageUrl(req, "jobs", job.image),
    }));

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("❌ getAllJobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await db.query(
      `SELECT j.* FROM job j WHERE j.id = ?`,
      [id]
    );

    if (!jobs.length) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = jobs[0];
    const responseData = {
      ...job,
      image: constructImageUrl(req, "jobs", job.image) || null,
    };

    res.status(200).json({
      success: true,
      job: responseData,
    });
  } catch (error) {
    console.error("❌ getJobById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const MyJobPostings = async (req, res) => {
  try {
    const production_house_id = req.user.id;

    // Enhanced SQL query with application count
    const sql = `
      SELECT 
        j.*,
        COUNT(ja.application_id) as application_count
      FROM job j
      LEFT JOIN job_applications ja ON j.id = ja.production_id
      WHERE j.production_house_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;

    const [results] = await db.query(sql, [production_house_id]);

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No job postings found",
        data: [],
        count: 0,
      });
    }

    // Format jobs with image URLs and additional info
    const jobs = results.map(job => {
      return {
        ...job,
        image_url: constructImageUrl(req, "jobCovers", job.image),
        application_count: parseInt(job.application_count) || 0,
        // Add status based on application deadline
        status: job.application_deadline && new Date(job.application_deadline) < new Date() 
          ? 'expired' 
          : 'active'
      };
    });

    return res.status(200).json({
      success: true,
      message: "Job postings fetched successfully",
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("❌ MyJobPostings error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error while fetching job postings",
      error: error.message,
    });
  }
};

// ===================== JOB APPLICATION MANAGEMENT =====================

const getAllApplicationsByProduction = async (req, res) => {
  try {
    const production_id = req.user.id; // From middleware

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
        u.id as user_id,
        u.name,
        u.email,
        u.mobile,
        u.city,
        u.date_of_birth,
        u.image as user_image
      FROM job_applications ja
      JOIN job j ON ja.production_id = j.id
      JOIN users u ON ja.user_id = u.id
      WHERE j.production_house_id = ?
      ORDER BY ja.created_at DESC
    `;

    const [results] = await db.query(sql, [production_id]);

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No job applications found",
        data: [],
        count: 0,
      });
    }

    // Format applications with age calculation and image URLs
    const applications = results.map(app => {
      const age = calculateAge(app.date_of_birth);

      return {
        application_id: app.application_id,
        status: app.status,
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
        },
        user: {
          id: app.user_id,
          name: app.name,
          email: app.email,
          mobile: app.mobile,
          city: app.city,
          age: age,
          image_url: constructImageUrl(req, "user_media", app.user_image),
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: "All job applications fetched successfully",
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("❌ getAllApplicationsByProduction error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error while fetching job applications",
      error: error.message,
    });
  }
};

const getApplicationsByJob = async (req, res) => {
  try {
    const job_id = req.params.id; // Job ID from route params
    const production_id = req.user.id; // From middleware

    // First verify that this job belongs to the authenticated production house
    const [jobCheck] = await db.query(
      `SELECT id FROM job WHERE id = ? AND production_house_id = ?`,
      [job_id, production_id]
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you are not authorized to view applications",
      });
    }

    const sql = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.mobile,
        u.city,
        u.date_of_birth,
        u.image AS user_image,
        u.gender,
        u.current_location,
        ja.application_id,
        ja.status,
        ja.role_specific_info,
        ja.travel,
        ja.availability,
        ja.created_at
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      WHERE ja.production_id = ?
      ORDER BY ja.created_at DESC
    `;

    const [results] = await db.query(sql, [job_id]);

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No applications found for this job",
        data: [],
        count: 0,
      });
    }

    // Format applications with age calculation and image URL
    const applications = results.map(app => {
      const age = calculateAge(app.date_of_birth);

      return {
        application_id: app.application_id,
        status: app.status,
        role_specific_info: app.role_specific_info,
        travel: app.travel,
        availability: app.availability,
        applied_on: app.created_at,
        user: {
          id: app.user_id,
          name: app.name,
          email: app.email,
          mobile: app.mobile,
          city: app.city,
          current_location: app.current_location,
          gender: app.gender,
          age: age,
          image_url: constructImageUrl(req, "user_media", app.user_image),
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("❌ getApplicationsByJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error while fetching applications",
      error: error.message,
    });
  }
};

// ===================== EXPORTS =====================

module.exports = {
  registerProductionHouse,
  loginProductionHouse,
  verifyProductionHouseOTP,
  forgotProductionHousePassword,
  resetProductionHousePassword,
  getProductionHouseProfile,
  updateProductionHouseProfile,
  getAllApplicationsByProduction,
  getApplicationsByJob,
  MyJobPostings,
  addJob,
  editJob,
  deleteJob,
  getAllJobs,
  getJobById,
  resendProductionHouseOTP,
};
