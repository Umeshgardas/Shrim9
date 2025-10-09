const express = require("express");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// GET dashboard stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const readyOrders = await Order.countDocuments({ status: "ready" });

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    res.json({
      totalCustomers,
      totalOrders,
      pendingOrders,
      readyOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;