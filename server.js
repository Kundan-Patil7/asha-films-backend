require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
// const helmet = require('helmet');
// const morgan = require('morgan');
const db = require("./config/database");
const contentRoutes = require("./routes/contentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRouter");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
// app.use(helmet()); // Security headers
// app.use(morgan('combined')); // Logging

// Health Check Route
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    res.json({ status: "ok", time: rows[0].time });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes


app.use("/api", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
