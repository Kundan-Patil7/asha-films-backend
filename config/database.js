// database.js
require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "casting_platform",
  waitForConnections: true,
  connectionLimit: process.env.DB_CONN_LIMIT || 15, // Adjust based on traffic
  queueLimit: 0,
  timezone: "Z", // Use UTC for consistency
  multipleStatements: false, // prevent SQL injection risks
});

// Use promise-based pool for async/await
const db = pool.promise();

// Test connection at startup
(async () => {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    console.log("✅ MySQL Connected. Server Time:", rows[0].time);
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("🔌 Database connection closed gracefully.");
    process.exit(0);
  } catch (err) {
    console.error("⚠️ Error closing DB pool:", err);
    process.exit(1);
  }
});

module.exports = db;
