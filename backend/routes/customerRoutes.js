const express = require('express');
const { addCustomer } = require('../controllers/customerController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addCustomer);

module.exports = router;
