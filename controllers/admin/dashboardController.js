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

module.exports = {
  fetchTickets,
  allUsers,
  suspendUser,
  blockUser,
  unsuspendUser,
  changePlan,
  createTicket
};
