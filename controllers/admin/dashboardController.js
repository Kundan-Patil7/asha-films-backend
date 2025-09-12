const db = require("../../config/database");
const path = require("path");
const fs = require("fs");


const fetchTickets = async (req, res) => {
  try {
    const fetchQuery = `SELECT * FROM tickets`;
    const [tickets] = await db.query(fetchQuery);

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const allUsers = async (req, res) => {
  try {
    const fetchQuery = `SELECT * FROM users`;
    const [users] = await db.query(fetchQuery);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const blockUser = async (req, res) => {
  const { userId, block } = req.body;

  if (typeof userId !== "number" || typeof block !== "boolean") {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET blocked = ? WHERE id = ?",
      [block, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${block ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    console.error(`Error blocking/unblocking user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const suspendUser = async (req, res) => {
  const { userId, suspendedFrom, suspendedTo } = req.body;

  if (!userId || !Date.parse(suspendedFrom) || !Date.parse(suspendedTo)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET suspended = ?, suspended_from = ?, suspended_to = ? WHERE id = ?",
      [true, suspendedFrom, suspendedTo, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User suspended from ${suspendedFrom} to ${suspendedTo}`,
    });
  } catch (error) {
    console.error(`Error suspending user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const unsuspendUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET suspended = ?, suspended_from = NULL, suspended_to = NULL WHERE id = ?",
      [false, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
    });
  } catch (error) {
    console.error(`Error unsuspending user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const changePlan = async (req, res) => {
  const { userId, newPlan } = req.body;

  if (!userId || !newPlan) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await db.query("UPDATE users SET plan = ? WHERE id = ?", [
      newPlan,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Plan updated successfully" });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createTicket = async (req, res) => {
  try {
    const { email, mobile_no, title, description } = req.body;

    if (!email || !mobile_no || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [result] = await db.query(
      "INSERT INTO tickets (email, mobile_no, title, description) VALUES (?, ?, ?, ?)",
      [email, mobile_no, title, description]
    );

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const approveJob = async (req, res) => {
   try {
    const { jobId, status } = req.body; 
 
    if (![1, 2].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
 
    await db.query(`UPDATE job SET status = ? WHERE id = ?`, [status, jobId]);
 
    res.status(200).json({
      success: true,
      message: `Job ${status === 1 ? "Approved" : "Discarded"} successfully`,
    });
  } catch (error) {
    console.error("❌ updateJobStatus error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const getAllTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        uph.id,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        uph.plan_id,
        uph.plan_name,
        uph.purchase_date,
        uph.expiry_date,
        uph.amount_paid,
        uph.payment_method,
        uph.transaction_id,
        uph.auto_renew,
        uph.verified_actor_badge,
        uph.consolidated_profile,
        uph.free_learning_videos,
        uph.unlimited_applications,
        uph.email_alerts,
        uph.whatsapp_alerts,
        uph.max_pics_upload,
        uph.max_intro_videos,
        uph.max_audition_videos,
        uph.max_work_links,
        uph.masterclass_access,
        uph.showcase_featured,
        uph.reward_points_on_testimonial,
        uph.created_at
      FROM user_plan_history uph
      JOIN users u ON uph.user_id = u.id
      ORDER BY uph.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      message: "All transaction history fetched successfully",
      transactions: rows,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching transaction history",
      error: error.message,
    });
  }
};


const   getDashboardData = async (req, res) => {
  try {
    // 1. Total users
    const [usersCount] = await db.query(`SELECT COUNT(*) as totalUsers FROM users`);
 
    // 2. Premium users
    const [premiumUsers] = await db.query(`SELECT COUNT(*) as premiumUsers FROM users WHERE plan = 'premium'`);
 
    // 3. Normal (free) users
    const [normalUsers] = await db.query(`SELECT COUNT(*) as normalUsers FROM users WHERE plan = 'free'`);
 
    // 4. Premium earnings (premium users × plan price from plans table)
    const [premiumPlan] = await db.query(`SELECT price FROM plans WHERE name = 'premium' LIMIT 1`);
    const premiumEarnings = premiumUsers[0].premiumUsers * (premiumPlan[0]?.price || 0);
 
    // 5. Total jobs
    const [totalJobs] = await db.query(`SELECT COUNT(*) as totalJobs FROM job`);
 
    // 6. Expired jobs (application_deadline < today)
    const [expiredJobs] = await db.query(`
      SELECT COUNT(*) as expiredJobs 
      FROM job 
      WHERE application_deadline IS NOT NULL AND application_deadline < CURDATE()
    `);
 
    // 7. Live jobs (application_deadline >= today OR no deadline)
    const [liveJobs] = await db.query(`
      SELECT COUNT(*) as liveJobs 
      FROM job 
      WHERE application_deadline IS NULL OR application_deadline >= CURDATE()
    `);
 
    res.json({
      success: true,
      data: {
        users: {
          total: usersCount[0].totalUsers,
          premium: premiumUsers[0].premiumUsers,
          normal: normalUsers[0].normalUsers,
        },
        earnings: {
          premiumEarnings,
          premiumPlanPrice: premiumPlan[0]?.price || 0
        },
        jobs: {
          total: totalJobs[0].totalJobs,
          expired: expiredJobs[0].expiredJobs,
          live: liveJobs[0].liveJobs
        },
        liveJobsOnly: liveJobs[0].liveJobs
      }
    });
 
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};


module.exports = {
  fetchTickets,
  allUsers,
  suspendUser,
  blockUser,
  unsuspendUser,
  changePlan,
  createTicket,
  approveJob,
  getAllTransactions,
  getDashboardData
};