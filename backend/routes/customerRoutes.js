// const express = require('express');
// const { addCustomer } = require('../controllers/customerController');
// const protect = require('../middleware/authMiddleware');
// const router = express.Router();

// router.post('/', protect, addCustomer);

// module.exports = router;


const express = require("express");
const Customer = require("../models/Customer");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// GET all customers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST create new customer
router.post("/", authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    
    console.log("Received customer data:", JSON.stringify(data, null, 2));
    
    // Process measurements - convert numbers and handle empty values
    if (data.measurements) {
      console.log("Measurements before processing:", data.measurements);
      
      for (const key in data.measurements) {
        const value = data.measurements[key];
        
        // Skip description fields from number conversion
        if (key !== 'shirtDescription' && key !== 'pantDescription') {
          if (value === "" || value === null || value === undefined) {
            // Remove empty values
            delete data.measurements[key];
          } else {
            // Convert to number
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              data.measurements[key] = numValue;
            } else {
              // If not a valid number, remove the field
              delete data.measurements[key];
            }
          }
        } else {
          // For description fields, remove if empty
          if (value === "" || value === null || value === undefined) {
            delete data.measurements[key];
          }
        }
      }
      
      console.log("Measurements after processing:", data.measurements);
    }

    const customer = await Customer.create(data);
    console.log("Saved customer:", customer);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET single customer
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT update customer
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    
    // Process measurements for update as well
    if (data.measurements) {
      for (const key in data.measurements) {
        const value = data.measurements[key];
        
        if (key !== 'shirtDescription' && key !== 'pantDescription') {
          if (value === "" || value === null || value === undefined) {
            delete data.measurements[key];
          } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              data.measurements[key] = numValue;
            } else {
              delete data.measurements[key];
            }
          }
        } else {
          if (value === "" || value === null || value === undefined) {
            delete data.measurements[key];
          }
        }
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE customer
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;