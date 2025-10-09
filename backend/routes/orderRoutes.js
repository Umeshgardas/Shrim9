// const express = require('express');
// const { addOrder } = require('../controllers/orderController');
// const protect = require('../middleware/authMiddleware');
// const router = express.Router();

// router.post('/', protect, addOrder);

// module.exports = router;


const express = require("express");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// GET all orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST create new order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT update order status
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE order
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// In your orderRoutes.js
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// In your dashboardRoutes.js  
router.get('/my-stats', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email });
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.price, 0)
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;