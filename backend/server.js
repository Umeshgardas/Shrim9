const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://shrim9.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());

// Database connection
const connectDB = require("./config/db");
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/dashboard", require("./routes/dashboadRoutes"));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Tailor Shop API is running!" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

// 🚨 CRITICAL FIX: Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;